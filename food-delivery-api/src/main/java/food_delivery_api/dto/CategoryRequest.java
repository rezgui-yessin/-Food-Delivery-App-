package food_delivery_api.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(@NotBlank String name, String description, int sortOrder, boolean active) {}
