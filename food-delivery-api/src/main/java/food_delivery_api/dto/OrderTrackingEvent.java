package food_delivery_api.dto;

import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;

import java.time.Instant;

public record OrderTrackingEvent(
        String orderId,
        OrderStatus status,
        String driverId,
        String driverName,
        Instant updatedAt,
        String message
) {
    public static OrderTrackingEvent from(Order order, String message) {
        return new OrderTrackingEvent(
                order.getId(),
                order.getStatus(),
                order.getDriverId(),
                order.getDriverName(),
                order.getUpdatedAt() != null ? order.getUpdatedAt() : Instant.now(),
                message
        );
    }
}
