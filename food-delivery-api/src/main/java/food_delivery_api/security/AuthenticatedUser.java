package food_delivery_api.security;

import food_delivery_api.modell.Role;

public record AuthenticatedUser(String id, String email, Role role) {}
