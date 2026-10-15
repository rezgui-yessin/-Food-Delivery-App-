package food_delivery_api.repository;

import food_delivery_api.modell.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
