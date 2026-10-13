package food_delivery_api.dto;

import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String restaurantId,
        String customerName,
        String customerPhone,
        String deliveryAddress,
        List<OrderItemResponse> items,
        BigDecimal totalAmount,
        OrderStatus status,
        Instant createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getRestaurantId(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
