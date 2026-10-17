package food_delivery_api.repository;

import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Order> findByRestaurantIdInOrderByCreatedAtDesc(Collection<String> restaurantIds);

    List<Order> findByStatusAndDriverIdIsNullOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByDriverIdOrderByCreatedAtDesc(String driverId);

    List<Order> findByDriverIdAndStatusInOrderByCreatedAtDesc(String driverId, Collection<OrderStatus> statuses);
}
