package food_delivery_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public record AddressRequest(
        @NotBlank String label,
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank String postalCode,
        @DecimalMin("-90") @DecimalMax("90") Double latitude,
        @DecimalMin("-180") @DecimalMax("180") Double longitude,
        boolean isDefault
) {}
