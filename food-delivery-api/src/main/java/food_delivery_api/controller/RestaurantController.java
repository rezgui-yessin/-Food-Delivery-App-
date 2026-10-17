package food_delivery_api.controller;


import food_delivery_api.dto.RestaurantRequest;
import food_delivery_api.dto.RestaurantResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;


@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> create(@Valid @RequestBody RestaurantRequest request,
                                                     @AuthenticationPrincipal AuthenticatedUser user) {
        RestaurantResponse created = restaurantService.create(request, user);
        return ResponseEntity
                .created(URI.create("/api/restaurants/" + created.id()))
                .body(created);
    }

    @GetMapping
    public List<RestaurantResponse> getAll(@RequestParam(required = false) String cuisine) {
        if (cuisine != null && !cuisine.isBlank()) {
            return restaurantService.getByCuisine(cuisine);
        }
        return restaurantService.getAll();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getById(@PathVariable String id) {
        return restaurantService.getById(id);
    }

    @PutMapping("/{id}")
    public RestaurantResponse update(@PathVariable String id,
                                     @Valid @RequestBody RestaurantRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return restaurantService.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id,
                       @AuthenticationPrincipal AuthenticatedUser user) {
        restaurantService.delete(id, user);
    }
}
