package food_delivery_api.dto;

import food_delivery_api.modell.Role;
import food_delivery_api.modell.User;

public record UserResponse(
        String id,
        String email,
        String fullName,
        Role role
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole());
    }
}
