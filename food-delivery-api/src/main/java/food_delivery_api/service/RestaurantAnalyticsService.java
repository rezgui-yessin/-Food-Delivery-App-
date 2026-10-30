package food_delivery_api.service;

import food_delivery_api.dto.RestaurantAnalyticsResponse;
import food_delivery_api.modell.Order;
import food_delivery_api.repository.OrderRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantAnalyticsService {
    private final RestaurantService restaurantService;
    private final OrderRepository orderRepository;
    public RestaurantAnalyticsResponse get(String restaurantId, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        var orders = orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        Instant now = Instant.now();
        BigDecimal daily = orders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(now.minus(1, ChronoUnit.DAYS)))
                .map(Order::getTotalAmount).filter(java.util.Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        var weeklyOrders = orders.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(now.minus(7, ChronoUnit.DAYS))).toList();
        BigDecimal total = orders.stream().map(Order::getTotalAmount).filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long pricedOrders = orders.stream().filter(o -> o.getTotalAmount() != null).count();
        BigDecimal average = pricedOrders == 0 ? BigDecimal.ZERO : total
                .divide(BigDecimal.valueOf(pricedOrders), 2, java.math.RoundingMode.HALF_UP);
        Map<String, Long> quantities = new HashMap<>();
        Map<String, BigDecimal> revenues = new HashMap<>();
        orders.stream().flatMap(o -> o.getItems() == null ? java.util.stream.Stream.empty() : o.getItems().stream())
                .forEach(item -> {
                    quantities.merge(item.getName(), (long) item.getQuantity(), Long::sum);
                    BigDecimal itemRevenue = item.getSubtotal() != null ? item.getSubtotal()
                            : (item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    revenues.merge(item.getName(), itemRevenue, BigDecimal::add);
                });
        var popular = quantities.entrySet().stream().sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())).limit(5)
                .map(e -> new RestaurantAnalyticsResponse.PopularProduct(e.getKey(), e.getValue(), revenues.getOrDefault(e.getKey(), BigDecimal.ZERO))).toList();
        return new RestaurantAnalyticsResponse(daily, weeklyOrders.size(), average, popular);
    }
}
