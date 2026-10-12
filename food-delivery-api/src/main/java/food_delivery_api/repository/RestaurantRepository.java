package food_delivery_api.repository;

import food_delivery_api.modell.Restaurant;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RestaurantRepository extends MongoRepository<Restaurant , String> {
    List<Restaurant> findByCuisineType(String cuisineType);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
}
