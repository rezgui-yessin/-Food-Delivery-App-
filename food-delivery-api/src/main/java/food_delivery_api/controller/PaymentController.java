package food_delivery_api.controller;

import com.stripe.model.PaymentIntent;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.dto.PaymentIntentResponse;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.Order;
import food_delivery_api.modell.PaymentMethod;
import food_delivery_api.modell.PaymentStatus;
import food_delivery_api.repository.OrderRepository;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.OrderService;
import food_delivery_api.service.OrderTrackingService;
import food_delivery_api.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final OrderTrackingService orderTrackingService;

    @Value("${stripe.currency:usd}")
    private String currency;

    @PostMapping("/orders/{orderId}/create-intent")
    public PaymentIntentResponse createPaymentIntent(@PathVariable String orderId,
                                                     @AuthenticationPrincipal AuthenticatedUser user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Ensure user is authorized to pay for this order
        orderService.requireCanAccess(order, user);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This order is already paid");
        }

        if (order.getPaymentMethod() != PaymentMethod.CARD) {
            order.setPaymentMethod(PaymentMethod.CARD);
        }

        PaymentIntent intent = stripeService.createPaymentIntent(order);
        if (intent == null) {
            order.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(order);
            return new PaymentIntentResponse(null, null, order.getTotalAmount(), currency, order.getId(), PaymentStatus.PAID);
        }

        order.setStripePaymentIntentId(intent.getId());
        order.setStripeClientSecret(intent.getClientSecret());
        orderRepository.save(order);

        return new PaymentIntentResponse(
                intent.getClientSecret(),
                intent.getId(),
                order.getTotalAmount(),
                currency,
                order.getId(),
                order.getPaymentStatus()
        );
    }

    /**
     * Testing endpoint: simulates instant payment confirmation for local testing
     * without needing live Stripe webhooks.
     */
    @PostMapping("/orders/{orderId}/confirm-test")
    public OrderResponse confirmTestPayment(@PathVariable String orderId,
                                            @AuthenticationPrincipal AuthenticatedUser user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        orderService.requireCanAccess(order, user);

        order.setPaymentStatus(PaymentStatus.PAID);
        Order saved = orderRepository.save(order);
        orderTrackingService.notifyStatusUpdate(saved, "Payment confirmed (test simulation)");
        return OrderResponse.from(saved);
    }
}
