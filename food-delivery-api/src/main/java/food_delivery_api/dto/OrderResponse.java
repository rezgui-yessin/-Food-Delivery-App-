package food_delivery_api.dto;

import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;

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
        List<OrderItemResponse> items,
        BigDecimal subtotalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String couponCode,
        OrderStatus status,
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
                o.getItems() != null ? o.getItems().stream().map(OrderItemResponse::from).toList() : List.of(),
                o.getSubtotalAmount() != null ? o.getSubtotalAmount() : o.getTotalAmount(),
                o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO,
                o.getTotalAmount(),
                o.getCouponCode(),
                o.getStatus(),
                o.getDriverId(),
                o.getDriverName(),
                o.getCreatedAt(),
                o.getUpdatedAt());
    }
}
