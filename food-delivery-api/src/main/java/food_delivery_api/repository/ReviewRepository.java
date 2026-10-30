package food_delivery_api.repository;

import food_delivery_api.modell.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    Optional<Review> findByRestaurantIdAndCustomerId(String restaurantId, String customerId);
    @Query(value = "{ 'restaurantId': ?0 }", fields = "{ 'rating': 1 }")
    List<Review> findRatingsByRestaurantId(String restaurantId);
}
