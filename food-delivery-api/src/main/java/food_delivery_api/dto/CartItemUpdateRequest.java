package food_delivery_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record CartItemUpdateRequest(
        @Min(value = 0, message = "Quantity cannot be negative")
        @Max(value = 50, message = "Quantity cannot exceed 50")
        int quantity,

        @Size(max = 200, message = "Special instructions cannot exceed 200 characters")
        String specialInstructions
) {
        public CartItemUpdateRequest(int quantity) {
                this(quantity, null);
        }
}
