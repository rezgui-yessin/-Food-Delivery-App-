package food_delivery_api.dto;

import food_delivery_api.modell.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "Status is required")
        OrderStatus status
) {}
