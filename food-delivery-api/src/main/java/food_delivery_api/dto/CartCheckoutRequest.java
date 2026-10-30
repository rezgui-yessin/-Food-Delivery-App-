package food_delivery_api.dto;

import food_delivery_api.modell.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;

public record CartCheckoutRequest(
        @NotBlank(message = "Customer name is required")
        String customerName,

        @NotBlank(message = "Customer phone is required")
        @Pattern(regexp = "^\\+?[0-9 ]{7,15}$", message = "Invalid phone number")
        String customerPhone,

        @NotBlank(message = "Delivery address is required")
        String deliveryAddress,

        String couponCode,

        PaymentMethod paymentMethod,
        Instant scheduledAt
) {
        public CartCheckoutRequest(String customerName, String customerPhone, String deliveryAddress, String couponCode) {
                this(customerName, customerPhone, deliveryAddress, couponCode, PaymentMethod.CARD, null);
        }

        public CartCheckoutRequest(String customerName, String customerPhone, String deliveryAddress) {
                this(customerName, customerPhone, deliveryAddress, null, PaymentMethod.CARD, null);
        }
}
