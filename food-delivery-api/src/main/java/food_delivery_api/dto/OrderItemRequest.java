package food_delivery_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrderItemRequest(
        @NotBlank(message = "Menu item ID is required")
        String menuItemId,

        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 50, message = "Quantity cannot exceed 50")
        int quantity,

        @Size(max = 200, message = "Special instructions cannot exceed 200 characters")
        String specialInstructions
) {
        public OrderItemRequest(String menuItemId, int quantity) {
                this(menuItemId, quantity, null);
        }
}
