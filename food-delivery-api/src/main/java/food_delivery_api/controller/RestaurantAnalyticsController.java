package food_delivery_api.controller;

import food_delivery_api.dto.RestaurantAnalyticsResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.RestaurantAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/analytics")
@RequiredArgsConstructor
public class RestaurantAnalyticsController {
    private final RestaurantAnalyticsService service;
    @GetMapping public RestaurantAnalyticsResponse get(@PathVariable String restaurantId, @AuthenticationPrincipal AuthenticatedUser user) {
        return service.get(restaurantId, user);
    }
}
