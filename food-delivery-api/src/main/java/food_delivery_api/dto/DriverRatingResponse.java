package food_delivery_api.dto;

import food_delivery_api.modell.DriverRating;
import java.time.Instant;

public record DriverRatingResponse(String id, String driverId, String orderId, int rating, String comment, Instant createdAt) {
    public static DriverRatingResponse from(DriverRating rating) {
        return new DriverRatingResponse(rating.getId(), rating.getDriverId(), rating.getOrderId(),
                rating.getRating(), rating.getComment(), rating.getCreatedAt());
    }
}
