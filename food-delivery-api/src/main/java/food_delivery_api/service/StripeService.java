package food_delivery_api.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.modell.Order;
import food_delivery_api.modell.PaymentStatus;
import food_delivery_api.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${stripe.api-key}")
    private String apiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.currency:usd}")
    private String currency;

    private final OrderRepository orderRepository;
    private final OrderTrackingService orderTrackingService;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank()) {
            Stripe.apiKey = apiKey;
            log.info("Stripe SDK initialized with currency: {}", currency);
        } else {
            log.warn("Stripe API key is not configured. Stripe operations will fail until configured.");
        }
    }

    /**
     * Creates a Stripe PaymentIntent for the given order.
     * Returns the PaymentIntent or null if the order amount is zero.
     */
    public PaymentIntent createPaymentIntent(Order order) {
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        long amountInCents = total.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        // If order total is $0 (e.g. 100% coupon), no need to invoke Stripe
        if (amountInCents <= 0) {
            log.info("Order {} total is zero, skipping Stripe PaymentIntent creation", order.getId());
            return null;
        }

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .setDescription("Payment for Order #" + order.getId())
                    .putMetadata("orderId", order.getId())
                    .putMetadata("restaurantId", order.getRestaurantId())
                    .putMetadata("customerId", order.getCustomerId() != null ? order.getCustomerId() : "guest")
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Created Stripe PaymentIntent {} for order {}", paymentIntent.getId(), order.getId());
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent for order {}: {}", order.getId(), e.getMessage());
            throw new BadRequestException("Failed to initiate payment: " + e.getMessage());
        }
    }

    /**
     * Issues a full or partial refund for a Stripe PaymentIntent.
     */
    public Refund refundPayment(String paymentIntentId, BigDecimal amount) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            log.warn("Cannot refund without a valid paymentIntentId");
            return null;
        }

        try {
            RefundCreateParams.Builder builder = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId);

            if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
                long amountInCents = amount.multiply(BigDecimal.valueOf(100))
                        .setScale(0, RoundingMode.HALF_UP)
                        .longValue();
                builder.setAmount(amountInCents);
            }

            Refund refund = Refund.create(builder.build());
            log.info("Successfully created Stripe refund {} for PaymentIntent {}", refund.getId(), paymentIntentId);
            return refund;
        } catch (StripeException e) {
            log.error("Stripe refund failed for PaymentIntent {}: {}", paymentIntentId, e.getMessage());
            throw new BadRequestException("Refund failed: " + e.getMessage());
        }
    }

    /**
     * Handles webhook callbacks from Stripe with signature verification.
     */
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature: {}", e.getMessage());
            throw new BadRequestException("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Stripe webhook parsing failed: {}", e.getMessage());
            throw new BadRequestException("Webhook parsing error: " + e.getMessage());
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            case "charge.refunded" -> handleChargeRefunded(event);
            default -> log.debug("Unhandled Stripe webhook event type: {}", event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (intent == null) {
            log.warn("Unable to deserialize PaymentIntent from succeeded event");
            return;
        }

        String orderId = intent.getMetadata().get("orderId");
        Optional<Order> orderOpt = orderId != null
                ? orderRepository.findById(orderId)
                : orderRepository.findByStripePaymentIntentId(intent.getId());

        orderOpt.ifPresentOrElse(order -> {
            order.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(order);
            log.info("Order {} marked as PAID via Stripe webhook", order.getId());
            orderTrackingService.notifyStatusUpdate(order, "Payment confirmed successfully via Stripe");
        }, () -> log.warn("No order found matching PaymentIntent {}", intent.getId()));
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (intent == null) return;

        String orderId = intent.getMetadata().get("orderId");
        Optional<Order> orderOpt = orderId != null
                ? orderRepository.findById(orderId)
                : orderRepository.findByStripePaymentIntentId(intent.getId());

        orderOpt.ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
            log.warn("Order {} payment marked as FAILED via Stripe webhook", order.getId());
            orderTrackingService.notifyStatusUpdate(order, "Payment failed. Please retry your payment method.");
        });
    }

    private void handleChargeRefunded(Event event) {
        com.stripe.model.Charge charge = (com.stripe.model.Charge) event.getDataObjectDeserializer().getObject().orElse(null);
        if (charge == null || charge.getPaymentIntent() == null) return;

        orderRepository.findByStripePaymentIntentId(charge.getPaymentIntent()).ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            orderRepository.save(order);
            log.info("Order {} payment marked as REFUNDED via Stripe webhook", order.getId());
            orderTrackingService.notifyStatusUpdate(order, "Order payment has been refunded");
        });
    }
}
