package food_delivery_api.service;



import food_delivery_api.dto.MenuItemRequest;
import food_delivery_api.dto.MenuItemResponse;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.MenuItem;
import food_delivery_api.repository.MenuItemRepository;
import food_delivery_api.repository.RestaurantRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final ImageStorageService imageStorageService;
    private final RestaurantService restaurantService;

    public MenuItemResponse create(String restaurantId, MenuItemRequest request, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);

        MenuItem item = MenuItem.builder()
                .restaurantId(restaurantId)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .available(request.available())
                .build();

        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    public List<MenuItemResponse> getByRestaurant(String restaurantId) {
        checkRestaurantExists(restaurantId);
        return menuItemRepository.findByRestaurantId(restaurantId).stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    public MenuItemResponse getById(String restaurantId, String id) {
        checkRestaurantExists(restaurantId);
        return MenuItemResponse.from(findItem(restaurantId, id));
    }

    public MenuItemResponse update(String restaurantId, String id,
                                   MenuItemRequest request, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        MenuItem item = findItem(restaurantId, id);

        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setCategory(request.category());
        item.setAvailable(request.available());

        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    public void delete(String restaurantId, String id, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        MenuItem item = findItem(restaurantId, id);

        imageStorageService.delete(item.getImagePublicId());
        menuItemRepository.delete(item);
    }

    public MenuItemResponse uploadImage(String restaurantId, String id,
                                        MultipartFile file, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        MenuItem item = findItem(restaurantId, id);
        String oldPublicId = item.getImagePublicId();

        ImageStorageService.StoredImage stored =
                imageStorageService.upload(file, "food-delivery/menu-items");

        item.setImageUrl(stored.url());
        item.setImagePublicId(stored.publicId());
        MenuItem saved = menuItemRepository.save(item);

        imageStorageService.delete(oldPublicId);
        return MenuItemResponse.from(saved);
    }

    public MenuItemResponse deleteImage(String restaurantId, String id, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        MenuItem item = findItem(restaurantId, id);

        imageStorageService.delete(item.getImagePublicId());
        item.setImageUrl(null);
        item.setImagePublicId(null);
        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    private void checkRestaurantExists(String restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
    }

    private MenuItem findItem(String restaurantId, String id) {
        return menuItemRepository.findByIdAndRestaurantId(id, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
    }
}