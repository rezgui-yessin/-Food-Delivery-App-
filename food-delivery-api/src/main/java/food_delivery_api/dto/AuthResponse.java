package food_delivery_api.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user
) {}
