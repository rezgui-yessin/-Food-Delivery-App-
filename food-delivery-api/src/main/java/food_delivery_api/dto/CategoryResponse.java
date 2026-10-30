package food_delivery_api.dto;

import food_delivery_api.modell.Category;

public record CategoryResponse(String id, String restaurantId, String name, String description, int sortOrder, boolean active) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getRestaurantId(), c.getName(), c.getDescription(), c.getSortOrder(), c.isActive());
    }
}
