package food_delivery_api.dto;

import java.util.List;

public record RestaurantSearchResponse(List<RestaurantResponse> items, int page, int size, long totalPages, long totalItems) {}
