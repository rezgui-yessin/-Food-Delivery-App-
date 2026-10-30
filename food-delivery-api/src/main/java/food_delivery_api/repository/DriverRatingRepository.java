package food_delivery_api.repository;

import food_delivery_api.modell.DriverRating;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DriverRatingRepository extends MongoRepository<DriverRating, String> {
    List<DriverRating> findByDriverIdOrderByCreatedAtDesc(String driverId);
    boolean existsByOrderIdAndCustomerId(String orderId, String customerId);
}
