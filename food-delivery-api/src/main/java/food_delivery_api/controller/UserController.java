package food_delivery_api.controller;

import food_delivery_api.dto.*;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {
    private final CustomerService customerService;

    @PutMapping
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.updateProfile(request, user);
    }

    @GetMapping("/addresses")
    public List<AddressResponse> getAddresses(@AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.getAddresses(user);
    }

    @PostMapping("/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addAddress(@Valid @RequestBody AddressRequest request,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.addAddress(request, user);
    }

    @PutMapping("/addresses/{id}")
    public AddressResponse updateAddress(@PathVariable String id, @Valid @RequestBody AddressRequest request,
                                         @AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.updateAddress(id, request, user);
    }

    @DeleteMapping("/addresses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@PathVariable String id, @AuthenticationPrincipal AuthenticatedUser user) {
        customerService.deleteAddress(id, user);
    }

    @GetMapping("/favorites")
    public List<RestaurantResponse> getFavorites(@AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.getFavorites(user);
    }

    @PostMapping("/favorites/{restaurantId}")
    public Map<String, Boolean> toggleFavorite(@PathVariable String restaurantId,
                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return Map.of("favorite", customerService.toggleFavorite(restaurantId, user));
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> getNotifications(@AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.getNotifications(user);
    }

    @PatchMapping("/notifications/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markNotificationRead(@PathVariable String id, @AuthenticationPrincipal AuthenticatedUser user) {
        customerService.markNotificationRead(id, user);
    }
}
