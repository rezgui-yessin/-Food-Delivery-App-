package food_delivery_api.repository;

import food_delivery_api.modell.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends MongoRepository<Coupon, String> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Coupon> findByRestaurantId(String restaurantId);

    List<Coupon> findByRestaurantIdIn(Collection<String> restaurantIds);

    List<Coupon> findByRestaurantIdIsNull();

    List<Coupon> findByActiveTrue();
}
