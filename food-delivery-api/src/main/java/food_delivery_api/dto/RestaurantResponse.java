package food_delivery_api.dto;

import food_delivery_api.modell.Restaurant;

public record RestaurantResponse(
        String id,
        String ownerId,
        String name,
        String description,
        String address,
        Double latitude,
        Double longitude,
        String phone,
        String cuisineType,
    boolean open,
    double rating,
    int deliveryTimeMin,
    java.math.BigDecimal deliveryFee,
    String imageUrl,
    java.util.Map<String, String> openingHours,
    boolean approved
) {
public static RestaurantResponse from(Restaurant r) {
    return new RestaurantResponse(
                r.getId(),
                r.getOwnerId(),
                r.getName(),
                r.getDescription(),
                r.getAddress(),
                r.getLatitude(),
                r.getLongitude(),
                r.getPhone(),
                r.getCuisineType(),
                r.isOpen(),
                r.getRating(),
                r.getDeliveryTimeMin(),
                r.getDeliveryFee(),
                r.getImageUrl(),
                r.getOpeningHours() == null ? java.util.Map.of() : r.getOpeningHours(),
                r.isApproved()
        );
    }
}