package food_delivery_api.repository;

import food_delivery_api.modell.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByRestaurantIdOrderBySortOrderAsc(String restaurantId);
}
