package food_delivery_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProfileUpdateRequest(
        @NotBlank String fullName,
        @Pattern(regexp = "^$|^\\+?[0-9 ]{7,15}$", message = "Invalid phone number") String phone
) {}
