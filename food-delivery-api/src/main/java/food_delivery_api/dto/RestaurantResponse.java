package food_delivery_api.dto;

import food_delivery_api.modell.Restaurant;

public record RestaurantResponse(
        String id,
        String ownerId,
        String name,
        String description,
        String address,
        String phone,
        String cuisineType,
        boolean open
) {
    public static RestaurantResponse from(Restaurant r) {
        return new RestaurantResponse(
                r.getId(),
                r.getOwnerId(),
                r.getName(),
                r.getDescription(),
                r.getAddress(),
                r.getPhone(),
                r.getCuisineType(),
                r.isOpen()
        );
    }
}