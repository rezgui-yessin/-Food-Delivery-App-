package food_delivery_api.dto;

import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;
import food_delivery_api.modell.PaymentMethod;
import food_delivery_api.modell.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String restaurantId,
        String customerId,
        String customerName,
        String customerPhone,
        String deliveryAddress,
        Double deliveryLatitude,
        Double deliveryLongitude,
        Double restaurantLatitude,
        Double restaurantLongitude,
        List<OrderItemResponse> items,
        BigDecimal subtotalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        BigDecimal deliveryFee,
        BigDecimal taxAmount,
        BigDecimal commissionAmount,
        Integer estimatedDeliveryMinutes,
        Instant scheduledAt,
        String couponCode,
        OrderStatus status,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String stripePaymentIntentId,
        String stripeClientSecret,
        String driverId,
        String driverName,
        Instant createdAt,
        Instant updatedAt) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getRestaurantId(),
                o.getCustomerId(),
                o.getCustomerName(),
                o.getCustomerPhone(),
                o.getDeliveryAddress(),
                o.getDeliveryLatitude(),
                o.getDeliveryLongitude(),
                o.getRestaurantLatitude(),
                o.getRestaurantLongitude(),
                o.getItems() != null ? o.getItems().stream().map(OrderItemResponse::from).toList() : List.of(),
                o.getSubtotalAmount() != null ? o.getSubtotalAmount() : o.getTotalAmount(),
                o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO,
                o.getTotalAmount(),
                o.getDeliveryFee() != null ? o.getDeliveryFee() : BigDecimal.ZERO,
                o.getTaxAmount() != null ? o.getTaxAmount() : BigDecimal.ZERO,
                o.getCommissionAmount() != null ? o.getCommissionAmount() : BigDecimal.ZERO,
                o.getEstimatedDeliveryMinutes(),
                o.getScheduledAt(),
                o.getCouponCode(),
                o.getStatus(),
                o.getPaymentMethod(),
                o.getPaymentStatus(),
                o.getStripePaymentIntentId(),
                o.getStripeClientSecret(),
                o.getDriverId(),
                o.getDriverName(),
                o.getCreatedAt(),
                o.getUpdatedAt());
    }
}
