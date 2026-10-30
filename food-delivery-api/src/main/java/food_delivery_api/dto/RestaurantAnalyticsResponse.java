package food_delivery_api.dto;

import java.math.BigDecimal;
import java.util.List;

public record RestaurantAnalyticsResponse(BigDecimal dailyRevenue, long weeklyOrders,
                                          BigDecimal averageOrderValue, List<PopularProduct> popularProducts) {
    public record PopularProduct(String name, long quantity, BigDecimal revenue) {}
}
