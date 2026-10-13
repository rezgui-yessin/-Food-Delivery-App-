package food_delivery_api.repository;

import food_delivery_api.modell.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByRestaurantId(String restaurantId);
}
