package food_delivery_api.service;

import food_delivery_api.dto.CategoryRequest;
import food_delivery_api.dto.CategoryResponse;
import food_delivery_api.modell.Category;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.repository.CategoryRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repository;
    private final RestaurantService restaurantService;

    public List<CategoryResponse> getAll(String restaurantId) {
        return repository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).stream().map(CategoryResponse::from).toList();
    }
    public CategoryResponse create(String restaurantId, CategoryRequest request, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        return CategoryResponse.from(repository.save(Category.builder().restaurantId(restaurantId).name(request.name().trim())
                .description(request.description()).sortOrder(request.sortOrder()).active(request.active()).build()));
    }
    public CategoryResponse update(String restaurantId, String id, CategoryRequest request, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        Category category = findOwned(restaurantId, id);
        category.setName(request.name().trim()); category.setDescription(request.description());
        category.setSortOrder(request.sortOrder()); category.setActive(request.active());
        return CategoryResponse.from(repository.save(category));
    }
    public void delete(String restaurantId, String id, AuthenticatedUser user) {
        restaurantService.requireManageable(restaurantId, user);
        repository.delete(findOwned(restaurantId, id));
    }

    private Category findOwned(String restaurantId, String id) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (!restaurantId.equals(category.getRestaurantId())) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        return category;
    }
}
