package food_delivery_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record OrderCreateRequest(
        @NotBlank(message = "Restaurant id is required") String restaurantId,

        @NotBlank(message = "Customer name is required") String customerName,

        @NotBlank(message = "Customer phone is required") @Pattern(regexp = "^\\+?[0-9 ]{7,15}$", message = "Invalid phone number") String customerPhone,

        @NotBlank(message = "Delivery address is required") String deliveryAddress,

        @NotEmpty(message = "Order must contain at least one item") @Valid List<OrderItemRequest> items,

        String couponCode) {
    public OrderCreateRequest(String restaurantId, String customerName, String customerPhone, String deliveryAddress, List<OrderItemRequest> items) {
        this(restaurantId, customerName, customerPhone, deliveryAddress, items, null);
    }
}
