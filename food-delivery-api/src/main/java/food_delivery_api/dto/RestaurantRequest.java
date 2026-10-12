package food_delivery_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RestaurantRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size ( max = 500, message = "Description must be at most 500 characters")
        String description,
        @NotBlank(message = "Address is required")
        String address,

        @Pattern(regexp = "^\\+?[0-9 ]{7,15}$", message = "Invalid phone number")
        String phone,

        @NotBlank(message = "Cuisine type is required")
        String cuisineType,

        boolean open

) {
}
