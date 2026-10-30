package food_delivery_api.dto;

import jakarta.validation.constraints.Size;

public record DeliveryProofRequest(
        @Size(max = 20000) String signature,
        @Size(max = 1000) String photoUrl,
        @Size(max = 20) String verificationCode) {}
