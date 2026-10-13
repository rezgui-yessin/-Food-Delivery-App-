package food_delivery_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record OrderItemRequest(
        @NotBlank(message = "Menu item ID is required")
        String menuItemId,
        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity
) {
}
