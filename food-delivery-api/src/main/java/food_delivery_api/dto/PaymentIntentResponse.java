package food_delivery_api.dto;

import food_delivery_api.modell.PaymentStatus;

import java.math.BigDecimal;

public record PaymentIntentResponse(
        String clientSecret,
        String paymentIntentId,
        BigDecimal amount,
        String currency,
        String orderId,
        PaymentStatus paymentStatus
) {
}
