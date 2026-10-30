package food_delivery_api.controller;


import food_delivery_api.dto.MenuItemRequest;
import food_delivery_api.dto.MenuItemResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PostMapping
    public ResponseEntity<MenuItemResponse> create(@PathVariable String restaurantId,
                                                   @Valid @RequestBody MenuItemRequest request,
                                                   @AuthenticationPrincipal AuthenticatedUser user) {
        MenuItemResponse created = menuItemService.create(restaurantId, request, user);
        return ResponseEntity
                .created(URI.create("/api/restaurants/" + restaurantId + "/menu-items/" + created.id()))
                .body(created);
    }

    @GetMapping
    public List<MenuItemResponse> getAll(@PathVariable String restaurantId) {
        return menuItemService.getByRestaurant(restaurantId);
    }

    @GetMapping("/{id}")
    public MenuItemResponse getById(@PathVariable String restaurantId,
                                    @PathVariable String id) {
        return menuItemService.getById(restaurantId, id);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(@PathVariable String restaurantId,
                                   @PathVariable String id,
                                   @Valid @RequestBody MenuItemRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser user) {
        return menuItemService.update(restaurantId, id, request, user);
    }

    @PatchMapping("/{id}/availability")
    public MenuItemResponse toggleAvailability(@PathVariable String restaurantId, @PathVariable String id,
                                               @RequestParam boolean available,
                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return menuItemService.toggleAvailability(restaurantId, id, available, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String restaurantId,
                       @PathVariable String id,
                       @AuthenticationPrincipal AuthenticatedUser user) {
        menuItemService.delete(restaurantId, id, user);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MenuItemResponse uploadImage(@PathVariable String restaurantId,
                                        @PathVariable String id,
                                        @RequestParam("file") MultipartFile file,
                                        @AuthenticationPrincipal AuthenticatedUser user) {
        return menuItemService.uploadImage(restaurantId, id, file, user);
    }

    @DeleteMapping("/{id}/image")
    public MenuItemResponse deleteImage(@PathVariable String restaurantId,
                                        @PathVariable String id,
                                        @AuthenticationPrincipal AuthenticatedUser user) {
        return menuItemService.deleteImage(restaurantId, id, user);
    }
}