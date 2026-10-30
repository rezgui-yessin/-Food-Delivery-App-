package food_delivery_api.dto;

import food_delivery_api.modell.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.util.List;
import java.time.Instant;

public record OrderCreateRequest(
        @NotBlank(message = "Restaurant id is required") String restaurantId,

        @NotBlank(message = "Customer name is required") String customerName,

        @NotBlank(message = "Customer phone is required") @Pattern(regexp = "^\\+?[0-9 ]{7,15}$", message = "Invalid phone number") String customerPhone,

        @NotBlank(message = "Delivery address is required") String deliveryAddress,

        @NotEmpty(message = "Order must contain at least one item") @Valid List<OrderItemRequest> items,

        String couponCode,

        PaymentMethod paymentMethod,

        Instant scheduledAt,
        @DecimalMin("-90") @DecimalMax("90") Double deliveryLatitude,
        @DecimalMin("-180") @DecimalMax("180") Double deliveryLongitude) {

    public OrderCreateRequest(String restaurantId, String customerName, String customerPhone, String deliveryAddress, List<OrderItemRequest> items, String couponCode) {
        this(restaurantId, customerName, customerPhone, deliveryAddress, items, couponCode, PaymentMethod.CARD, null, null, null);
    }

    public OrderCreateRequest(String restaurantId, String customerName, String customerPhone, String deliveryAddress,
                              List<OrderItemRequest> items, String couponCode, PaymentMethod paymentMethod) {
        this(restaurantId, customerName, customerPhone, deliveryAddress, items, couponCode, paymentMethod, null, null, null);
    }

    public OrderCreateRequest(String restaurantId, String customerName, String customerPhone, String deliveryAddress, List<OrderItemRequest> items) {
        this(restaurantId, customerName, customerPhone, deliveryAddress, items, null, PaymentMethod.CARD, null, null, null);
    }
}
