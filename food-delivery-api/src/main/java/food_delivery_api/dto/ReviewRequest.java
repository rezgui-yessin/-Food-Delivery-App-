package food_delivery_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(@Min(1) @Max(5) int rating, @NotBlank String comment) {}
