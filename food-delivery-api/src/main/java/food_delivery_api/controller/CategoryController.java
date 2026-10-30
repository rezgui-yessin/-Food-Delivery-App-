package food_delivery_api.controller;

import food_delivery_api.dto.*;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;
    @GetMapping public List<CategoryResponse> getAll(@PathVariable String restaurantId) { return service.getAll(restaurantId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@PathVariable String restaurantId, @Valid @RequestBody CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser user) { return service.create(restaurantId, request, user); }
    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable String restaurantId, @PathVariable String id, @Valid @RequestBody CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser user) { return service.update(restaurantId, id, request, user); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String restaurantId, @PathVariable String id, @AuthenticationPrincipal AuthenticatedUser user) { service.delete(restaurantId, id, user); }
}
