package food_delivery_api.repository;

import food_delivery_api.modell.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {

    List<MenuItem> findByRestaurantId(String restaurantId);

    Optional<MenuItem> findByIdAndRestaurantId(String id, String restaurantId);

    void deleteByRestaurantId(String restaurantId);
}
