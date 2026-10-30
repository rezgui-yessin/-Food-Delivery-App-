package food_delivery_api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MenuItemRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        BigDecimal price,

        @NotBlank(message = "Category is required")
        String category,

        boolean available
        , int stockQuantity
        , int preparationTimeMinutes
        , int sortOrder
) {
    public MenuItemRequest(String name, String description, BigDecimal price, String category, boolean available) {
        this(name, description, price, category, available, 0, 20, 0);
    }
}
