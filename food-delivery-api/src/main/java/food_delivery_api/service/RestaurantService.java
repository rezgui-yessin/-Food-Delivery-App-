package food_delivery_api.service;

import food_delivery_api.dto.RestaurantRequest;
import food_delivery_api.dto.RestaurantResponse;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.Restaurant;
import food_delivery_api.modell.Role;
import food_delivery_api.security.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;

import food_delivery_api.repository.MenuItemRepository;
import food_delivery_api.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final ImageStorageService imageStorageService;
    private final food_delivery_api.repository.ReviewRepository reviewRepository;


    public RestaurantResponse create(RestaurantRequest request, AuthenticatedUser user) {
        Restaurant restaurant = Restaurant.builder()
                .ownerId(user != null ? user.id() : null)
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .phone(request.phone())
                .cuisineType(request.cuisineType())
                .open(request.open())
                .openingHours(request.openingHours())
                .build();

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse create(RestaurantRequest request) {
        return create(request, null);
    }

    public Restaurant requireManageable(String restaurantId, AuthenticatedUser user) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + restaurantId));

        if (!canManage(restaurant, user)) {
            throw new AccessDeniedException("Not allowed to manage this restaurant");
        }
        return restaurant;
    }

    public boolean canManage(Restaurant restaurant, AuthenticatedUser user) {
        if (user == null) {
            return false;
        }
        return user.role() == Role.ADMIN || (user.id() != null && user.id().equals(restaurant.getOwnerId()));
    }

    public List<RestaurantResponse> getAll() {
        return restaurantRepository.findAll().stream()
                .map(RestaurantResponse::from)
                .toList();
    }

    public List<RestaurantResponse> getByCuisine(String cuisineType) {
        return restaurantRepository.findByCuisineType(cuisineType).stream()
                .map(RestaurantResponse::from)
                .toList();
    }

    public RestaurantResponse getById(String id) {
        return toResponse(findOrThrow(id));
    }

    public food_delivery_api.dto.RestaurantSearchResponse search(String query, String cuisine, Boolean open,
                                                                  Double minRating, Integer maxDeliveryTime,
                                                                  int page, int size, String sort) {
        List<RestaurantResponse> matches = restaurantRepository.findAll().stream()
                .filter(r -> query == null || query.isBlank() || (r.getName() + " " + r.getCuisineType()).toLowerCase().contains(query.toLowerCase()))
                .filter(r -> cuisine == null || cuisine.isBlank() || r.getCuisineType().equalsIgnoreCase(cuisine))
                .filter(r -> open == null || !open || r.isOpen())
                .map(this::toResponse)
                .filter(r -> minRating == null || r.rating() >= minRating)
                .filter(r -> maxDeliveryTime == null || r.deliveryTimeMin() <= maxDeliveryTime)
                .sorted((a, b) -> "rating".equalsIgnoreCase(sort)
                        ? Double.compare(b.rating(), a.rating())
                        : a.name().compareToIgnoreCase(b.name()))
                .toList();
        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(0, page);
        int from = Math.min(safePage * safeSize, matches.size());
        int to = Math.min(from + safeSize, matches.size());
        long totalPages = (matches.size() + safeSize - 1L) / safeSize;
        return new food_delivery_api.dto.RestaurantSearchResponse(matches.subList(from, to), safePage, safeSize, totalPages, matches.size());
    }

    public RestaurantResponse update(String id, RestaurantRequest request, AuthenticatedUser user) {
        Restaurant restaurant = requireManageable(id, user);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setAddress(request.address());
        restaurant.setLatitude(request.latitude());
        restaurant.setLongitude(request.longitude());
        restaurant.setPhone(request.phone());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setOpen(request.open());
        if (request.openingHours() != null) {
            restaurant.setOpeningHours(request.openingHours());
        }

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse update(String id, RestaurantRequest request) {
        Restaurant restaurant = findOrThrow(id);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setAddress(request.address());
        restaurant.setLatitude(request.latitude());
        restaurant.setLongitude(request.longitude());
        restaurant.setPhone(request.phone());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setOpen(request.open());
        if (request.openingHours() != null) {
            restaurant.setOpeningHours(request.openingHours());
        }

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    public void delete(String id, AuthenticatedUser user) {
        Restaurant restaurant = requireManageable(id, user);
        menuItemRepository.findByRestaurantId(id)
                .forEach(item -> imageStorageService.delete(item.getImagePublicId()));
        menuItemRepository.deleteByRestaurantId(id);
        restaurantRepository.delete(restaurant);
    }

    public void delete(String id) {
        Restaurant restaurant = findOrThrow(id);
        menuItemRepository.findByRestaurantId(id)
                .forEach(item -> imageStorageService.delete(item.getImagePublicId()));
        menuItemRepository.deleteByRestaurantId(id);
        restaurantRepository.delete(restaurant);
    }

    public RestaurantResponse uploadImage(String id, MultipartFile file, AuthenticatedUser user) {
        Restaurant restaurant = requireManageable(id, user);
        String oldPublicId = restaurant.getImagePublicId();
        ImageStorageService.StoredImage stored = imageStorageService.upload(file, "food-delivery/restaurants");
        restaurant.setImageUrl(stored.url());
        restaurant.setImagePublicId(stored.publicId());
        Restaurant saved = restaurantRepository.save(restaurant);
        imageStorageService.delete(oldPublicId);
        return RestaurantResponse.from(saved);
    }

    public RestaurantResponse updateHours(String id, java.util.Map<String, String> hours, AuthenticatedUser user) {
        Restaurant restaurant = requireManageable(id, user);
        restaurant.setOpeningHours(hours == null ? java.util.Map.of() : hours);
        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    private Restaurant findOrThrow(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
    }

    private RestaurantResponse toResponse(Restaurant restaurant) {
        List<food_delivery_api.modell.Review> reviews = reviewRepository.findRatingsByRestaurantId(restaurant.getId());
        if (!reviews.isEmpty()) {
            restaurant.setRating(reviews.stream().mapToInt(food_delivery_api.modell.Review::getRating).average().orElse(0));
        }
        return RestaurantResponse.from(restaurant);
    }
}
