package food_delivery_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public record RestaurantRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size ( max = 500, message = "Description must be at most 500 characters")
        String description,
        @NotBlank(message = "Address is required")
        String address,
        @DecimalMin("-90") @DecimalMax("90") Double latitude,
        @DecimalMin("-180") @DecimalMax("180") Double longitude,

        @Pattern(regexp = "^\\+?[0-9 ]{7,15}$", message = "Invalid phone number")
        String phone,

        @NotBlank(message = "Cuisine type is required")
        String cuisineType,
        boolean open,
        java.util.Map<String, String> openingHours

) {
    public RestaurantRequest(String name, String description, String address, String phone, String cuisineType, boolean open) {
        this(name, description, address, null, null, phone, cuisineType, open, java.util.Map.of());
    }
}
