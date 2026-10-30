package food_delivery_api.dto;

import food_delivery_api.modell.MenuItem;

import java.math.BigDecimal;

public record MenuItemResponse(
        String id,
        String restaurantId,
        String name,
        String description,
        BigDecimal price,
        String category,
        boolean available,
        String imageUrl,
        int stockQuantity,
        int preparationTimeMinutes,
        int sortOrder
) {
    public static MenuItemResponse from(MenuItem m) {
        return new MenuItemResponse(
                m.getId(),
                m.getRestaurantId(),
                m.getName(),
                m.getDescription(),
                m.getPrice(),
                m.getCategory(),
                m.isAvailable(),
                m.getImageUrl(),
                m.getStockQuantity(),
                m.getPreparationTimeMinutes(),
                m.getSortOrder() );
}
}
