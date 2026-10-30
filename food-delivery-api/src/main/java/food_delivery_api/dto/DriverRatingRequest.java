package food_delivery_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record DriverRatingRequest(
        @Min(1) @Max(5) int rating,
        @Size(max = 500) String comment) {}
