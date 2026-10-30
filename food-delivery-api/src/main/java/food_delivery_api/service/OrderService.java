package food_delivery_api.service;

import com.stripe.model.PaymentIntent;
import food_delivery_api.dto.OrderCreateRequest;
import food_delivery_api.dto.OrderItemRequest;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.dto.OrderStatusUpdateRequest;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ConflictException;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.MenuItem;
import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderItem;
import food_delivery_api.modell.OrderStatus;
import food_delivery_api.modell.PaymentMethod;
import food_delivery_api.modell.PaymentStatus;
import food_delivery_api.modell.Notification;
import food_delivery_api.modell.Restaurant;
import food_delivery_api.modell.Role;
import food_delivery_api.modell.User;
import food_delivery_api.repository.MenuItemRepository;
import food_delivery_api.repository.OrderRepository;
import food_delivery_api.repository.RestaurantRepository;
import food_delivery_api.repository.UserRepository;
import food_delivery_api.repository.NotificationRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int MAX_QUANTITY_PER_ITEM = 50;

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final OrderTrackingService orderTrackingService;
    private final CouponService couponService;
    private final StripeService stripeService;
    private final NotificationRepository notificationRepository;

    public OrderResponse create(OrderCreateRequest request, AuthenticatedUser user) {
        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + request.restaurantId()));

        if (!restaurant.isOpen()) {
            throw new BadRequestException("Restaurant is currently closed");
        }

        // Merge duplicate lines: the same menu item twice becomes one line
        Map<String, Integer> quantities = new LinkedHashMap<>();
        Map<String, String> instructions = new LinkedHashMap<>();
        for (OrderItemRequest line : request.items()) {
            quantities.merge(line.menuItemId(), line.quantity(), Integer::sum);
            if (line.specialInstructions() != null && !line.specialInstructions().isBlank()) {
                instructions.merge(line.menuItemId(), line.specialInstructions().trim(), (a, b) -> a + "; " + b);
            }
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<String, Integer> entry : quantities.entrySet()) {
            MenuItem menuItem = menuItemRepository
                    .findByIdAndRestaurantId(entry.getKey(), restaurant.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Menu item not found in this restaurant: " + entry.getKey()));

            if (!menuItem.isAvailable()) {
                throw new BadRequestException("Menu item is not available: " + menuItem.getName());
            }

            int quantity = entry.getValue();
            if (quantity > MAX_QUANTITY_PER_ITEM) {
                throw new BadRequestException(
                        "Quantity for " + menuItem.getName() + " must be at most " + MAX_QUANTITY_PER_ITEM);
            }

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(lineTotal);

            items.add(OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .name(menuItem.getName())
                    .unitPrice(menuItem.getPrice())
                    .quantity(quantity)
                    .subtotal(lineTotal)
                    .specialInstructions(instructions.get(entry.getKey()))
                    .build());
        }

        BigDecimal subtotal = total;
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCouponCode = null;

        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            appliedCouponCode = request.couponCode().trim().toUpperCase();
            discount = couponService.applyAndRedeemCoupon(appliedCouponCode, restaurant.getId(), subtotal);
        }

        BigDecimal taxableSubtotal = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal taxRate = restaurant.getTaxRate() != null ? restaurant.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount = taxableSubtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal deliveryFee = restaurant.getDeliveryFee() != null ? restaurant.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal finalTotal = taxableSubtotal.add(taxAmount).add(deliveryFee);
        BigDecimal commissionRate = restaurant.getCommissionRate() != null ? restaurant.getCommissionRate() : BigDecimal.ZERO;
        BigDecimal commissionAmount = taxableSubtotal.multiply(commissionRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

        PaymentMethod paymentMethod = request.paymentMethod() != null ? request.paymentMethod() : PaymentMethod.CARD;
        PaymentStatus initialPaymentStatus = finalTotal.compareTo(BigDecimal.ZERO) == 0
                ? PaymentStatus.PAID
                : PaymentStatus.PENDING;

        Instant now = Instant.now();
        Order order = Order.builder()
                .restaurantId(restaurant.getId())
                .customerId(user != null ? user.id() : null)
                .customerName(request.customerName())
                .customerPhone(request.customerPhone())
                .deliveryAddress(request.deliveryAddress())
                .deliveryLatitude(request.deliveryLatitude())
                .deliveryLongitude(request.deliveryLongitude())
                .restaurantLatitude(restaurant.getLatitude())
                .restaurantLongitude(restaurant.getLongitude())
                .items(items)
                .couponCode(appliedCouponCode)
                .subtotalAmount(subtotal)
                .discountAmount(discount)
                .deliveryFee(deliveryFee)
                .taxAmount(taxAmount)
                .commissionAmount(commissionAmount)
                .estimatedDeliveryMinutes(restaurant.getDeliveryTimeMin())
                .scheduledAt(request.scheduledAt())
                .totalAmount(finalTotal)
                .paymentMethod(paymentMethod)
                .paymentStatus(initialPaymentStatus)
                .status(OrderStatus.PLACED)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Order saved = orderRepository.save(order);

        // If paying with Card and total > 0, generate Stripe PaymentIntent
        if (paymentMethod == PaymentMethod.CARD && finalTotal.compareTo(BigDecimal.ZERO) > 0) {
            try {
                PaymentIntent intent = stripeService.createPaymentIntent(saved);
                if (intent != null) {
                    saved.setStripePaymentIntentId(intent.getId());
                    saved.setStripeClientSecret(intent.getClientSecret());
                    saved = orderRepository.save(saved);
                }
            } catch (Exception e) {
                log.error("Failed to initialize Stripe PaymentIntent during order creation: {}", e.getMessage());
            }
        }

        String eventMsg = appliedCouponCode != null
                ? "Order placed with coupon " + appliedCouponCode + " (saved $" + discount + ")"
                : "Order placed successfully";
        orderTrackingService.notifyStatusUpdate(saved, eventMsg);
        createCustomerNotification(saved, "Order placed", eventMsg);
        return OrderResponse.from(saved);
    }

    public OrderResponse reorder(String id, AuthenticatedUser user) {
        Order previous = getOwnedOrder(id, user);
        OrderCreateRequest request = new OrderCreateRequest(
                previous.getRestaurantId(),
                previous.getCustomerName(),
                previous.getCustomerPhone(),
                previous.getDeliveryAddress(),
                previous.getItems().stream()
                        .map(item -> new OrderItemRequest(item.getMenuItemId(), item.getQuantity(), item.getSpecialInstructions()))
                        .toList(),
                null,
                PaymentMethod.CARD);
        return create(request, user);
    }

    private Order getOwnedOrder(String id, AuthenticatedUser user) {
        if (user == null) throw new AccessDeniedException("Authentication required");
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (user.role() == Role.ADMIN || (user.id().equals(order.getCustomerId()))) return order;
        throw new AccessDeniedException("Not allowed to reorder this order");
    }

    public List<OrderResponse> getAll(String restaurantId, OrderStatus status, AuthenticatedUser user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }

        List<Order> orders = switch (user.role()) {
            case ADMIN -> orderRepository.findAllByOrderByCreatedAtDesc();
            case CUSTOMER -> orderRepository.findByCustomerIdOrderByCreatedAtDesc(user.id());
            case DELIVERY_DRIVER -> orderRepository.findByDriverIdOrderByCreatedAtDesc(user.id());
            case RESTAURANT_OWNER -> {
                List<String> ownedIds = restaurantRepository.findByOwnerId(user.id()).stream()
                        .map(Restaurant::getId)
                        .toList();
                yield ownedIds.isEmpty()
                        ? List.of()
                        : orderRepository.findByRestaurantIdInOrderByCreatedAtDesc(ownedIds);
            }
        };

        boolean filterByRestaurant = restaurantId != null && !restaurantId.isBlank();

        return orders.stream()
                .filter(o -> !filterByRestaurant || o.getRestaurantId().equals(restaurantId))
                .filter(o -> status == null || o.getStatus() == status)
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> getByRestaurant(String restaurantId, AuthenticatedUser user) {
        return getAll(restaurantId, null, user);
    }

    public OrderResponse getById(String id, AuthenticatedUser user) {
        Order order = findOrThrow(id);
        requireCanAccess(order, user);
        return OrderResponse.from(order);
    }

    public List<OrderResponse> getAvailableOrdersForPickup(AuthenticatedUser user) {
        if (user == null || (user.role() != Role.DELIVERY_DRIVER && user.role() != Role.ADMIN)) {
            throw new AccessDeniedException("Only delivery drivers or admins can view available pickup orders");
        }
        return orderRepository.findByStatusAndDriverIdIsNullOrderByCreatedAtDesc(OrderStatus.READY_FOR_PICKUP)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> getMyDeliveries(AuthenticatedUser user) {
        if (user == null || (user.role() != Role.DELIVERY_DRIVER && user.role() != Role.ADMIN)) {
            throw new AccessDeniedException("Only delivery drivers can view their assigned deliveries");
        }
        return orderRepository.findByDriverIdOrderByCreatedAtDesc(user.id())
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse acceptOrder(String id, AuthenticatedUser user) {
        if (user == null || (user.role() != Role.DELIVERY_DRIVER && user.role() != Role.ADMIN)) {
            throw new AccessDeniedException("Only delivery drivers can accept orders for delivery");
        }

        Order order = findOrThrow(id);

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new BadRequestException("Order is not ready for pickup (current status: " + order.getStatus() + ")");
        }

        if (order.getDriverId() != null) {
            throw new ConflictException("Order has already been accepted by another driver");
        }

        String driverName = userRepository.findById(user.id())
                .map(User::getFullName)
                .orElse("Driver");

        order.setDriverId(user.id());
        order.setDriverName(driverName);
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);
        orderTrackingService.notifyStatusUpdate(saved, "Driver " + driverName + " accepted order for delivery");
        return OrderResponse.from(saved);
    }

    public void rejectOrder(String id, AuthenticatedUser user) {
        if (user == null || (user.role() != Role.DELIVERY_DRIVER && user.role() != Role.ADMIN)) {
            throw new AccessDeniedException("Only delivery drivers can reject orders");
        }
        Order order = findOrThrow(id);
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP || order.getDriverId() != null) {
            throw new BadRequestException("Order is no longer available for rejection");
        }
    }

    public OrderResponse updateStatus(String id, OrderStatusUpdateRequest request, AuthenticatedUser user) {
        Order order = findOrThrow(id);
        requireCanAccess(order, user);

        OrderStatus next = request.status();

        if (user != null) {
            switch (user.role()) {
                case CUSTOMER -> {
                    if (next != OrderStatus.CANCELLED) {
                        throw new AccessDeniedException("Customers can only cancel orders");
                    }
                    if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.PENDING) {
                        throw new BadRequestException("An order can only be cancelled by the customer while it is PLACED");
                    }
                }
                case DELIVERY_DRIVER -> {
                    if (!user.id().equals(order.getDriverId())) {
                        throw new AccessDeniedException("You are not the assigned driver for this order");
                    }
                    if (next != OrderStatus.PICKED_UP && next != OrderStatus.OUT_FOR_DELIVERY && next != OrderStatus.DELIVERED) {
                        throw new BadRequestException("Drivers can only update status to PICKED_UP, OUT_FOR_DELIVERY, or DELIVERED");
                    }
                }
                case RESTAURANT_OWNER -> {
                    if (next == OrderStatus.PICKED_UP || next == OrderStatus.OUT_FOR_DELIVERY || next == OrderStatus.DELIVERED) {
                        throw new BadRequestException("Status updates after pickup must be performed by the delivery driver");
                    }
                }
                case ADMIN -> {
                    // Admins are allowed to perform any valid state transition
                }
            }
        }

        if (order.getStatus() != null && !order.getStatus().canTransitionTo(next)) {
            throw new BadRequestException(
                    "Cannot change order status from " + order.getStatus() + " to " + next);
        }

        order.setStatus(next);
        order.setUpdatedAt(Instant.now());

        // Auto-refund if order is cancelled and was already paid via Stripe
        if (next == OrderStatus.CANCELLED) {
            if (order.getPaymentStatus() == PaymentStatus.PAID && order.getStripePaymentIntentId() != null) {
                try {
                    stripeService.refundPayment(order.getStripePaymentIntentId(), order.getTotalAmount());
                    order.setPaymentStatus(PaymentStatus.REFUNDED);
                    log.info("Auto-refunded cancelled order {}", order.getId());
                } catch (Exception e) {
                    log.error("Failed to refund cancelled order {}: {}", order.getId(), e.getMessage());
                }
            }
        }

        // If Cash On Delivery and order is delivered, mark payment as PAID
        if (next == OrderStatus.DELIVERED) {
            if (order.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY && order.getPaymentStatus() == PaymentStatus.PENDING) {
                order.setPaymentStatus(PaymentStatus.PAID);
                log.info("Cash-on-delivery order {} marked as PAID upon delivery", order.getId());
            }
        }

        Order saved = orderRepository.save(order);
        orderTrackingService.notifyStatusUpdate(saved, "Order status changed to " + next);
        createCustomerNotification(saved, "Order update", "Your order is now " + next.name().replace('_', ' ').toLowerCase() + ".");
        return OrderResponse.from(saved);
    }

    private void createCustomerNotification(Order order, String title, String message) {
        if (order.getCustomerId() == null) return;
        notificationRepository.save(Notification.builder()
                .userId(order.getCustomerId())
                .title(title)
                .message(message)
                .type("ORDER_STATUS")
                .referenceId(order.getId())
                .read(false)
                .createdAt(Instant.now())
                .build());
    }

    public SseEmitter subscribeToTracking(String id, AuthenticatedUser user) {
        Order order = findOrThrow(id);
        requireCanAccess(order, user);
        return orderTrackingService.subscribe(id, order);
    }

    public void requireCanAccess(Order order, AuthenticatedUser user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean allowed = switch (user.role()) {
            case ADMIN -> true;
            case CUSTOMER -> user.id() != null && user.id().equals(order.getCustomerId());
            case DELIVERY_DRIVER -> (user.id() != null && user.id().equals(order.getDriverId()))
                    || order.getStatus() == OrderStatus.READY_FOR_PICKUP;
            case RESTAURANT_OWNER -> restaurantRepository.findById(order.getRestaurantId())
                    .map(r -> user.id() != null && user.id().equals(r.getOwnerId()))
                    .orElse(false);
        };

        if (!allowed) {
            throw new AccessDeniedException("Not allowed to access this order");
        }
    }

    private Order findOrThrow(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
}
