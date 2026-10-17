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

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final ImageStorageService imageStorageService;


    public RestaurantResponse create(RestaurantRequest request, AuthenticatedUser user) {
        Restaurant restaurant = Restaurant.builder()
                .ownerId(user != null ? user.id() : null)
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .phone(request.phone())
                .cuisineType(request.cuisineType())
                .open(request.open())
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
        return RestaurantResponse.from(findOrThrow(id));
    }

    public RestaurantResponse update(String id, RestaurantRequest request, AuthenticatedUser user) {
        Restaurant restaurant = requireManageable(id, user);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setAddress(request.address());
        restaurant.setPhone(request.phone());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setOpen(request.open());

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse update(String id, RestaurantRequest request) {
        Restaurant restaurant = findOrThrow(id);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setAddress(request.address());
        restaurant.setPhone(request.phone());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setOpen(request.open());

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

    private Restaurant findOrThrow(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
    }
}
