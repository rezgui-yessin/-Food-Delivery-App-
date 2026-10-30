package food_delivery_api.dto;

import food_delivery_api.modell.Review;

import java.time.Instant;

public record ReviewResponse(String id, String restaurantId, String customerId, String customerName,
                             int rating, String comment, Instant createdAt, Instant updatedAt) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(review.getId(), review.getRestaurantId(), review.getCustomerId(),
                review.getCustomerName(), review.getRating(), review.getComment(),
                review.getCreatedAt(), review.getUpdatedAt());
    }
}
