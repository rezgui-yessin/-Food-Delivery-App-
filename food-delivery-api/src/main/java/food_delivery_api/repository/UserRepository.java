package food_delivery_api.repository;

import food_delivery_api.modell.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;
import food_delivery_api.modell.Role;

public interface UserRepository extends MongoRepository<User, String> {
Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
}
