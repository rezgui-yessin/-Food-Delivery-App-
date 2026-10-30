package food_delivery_api.dto;

import food_delivery_api.modell.Role;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(Role role, Boolean active, Boolean approved,
                                     @Size(max = 100) String fullName) {}
