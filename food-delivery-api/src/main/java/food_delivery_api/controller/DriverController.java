package food_delivery_api.controller;

import food_delivery_api.dto.*;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService service;

    @GetMapping("/me")
    public DriverProfileResponse profile(@AuthenticationPrincipal AuthenticatedUser user) { return service.getProfile(user); }

    @PutMapping("/me")
    public DriverProfileResponse updateProfile(@Valid @RequestBody DriverProfileRequest request,
                                                @AuthenticationPrincipal AuthenticatedUser user) {
        return service.updateProfile(request, user);
    }

    @PatchMapping("/me/availability")
    public DriverProfileResponse availability(@RequestParam boolean available,
                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return service.setAvailability(available, user);
    }

    @PatchMapping("/me/location")
    public DriverProfileResponse location(@Valid @RequestBody DriverLocationRequest request,
                                          @AuthenticationPrincipal AuthenticatedUser user) {
        return service.updateLocation(request, user);
    }

    @GetMapping("/me/earnings")
    public DriverEarningsResponse earnings(@AuthenticationPrincipal AuthenticatedUser user) {
        return service.getEarnings(user);
    }

    @PostMapping("/deliveries/{orderId}/proof")
    public OrderResponse proof(@PathVariable String orderId, @Valid @RequestBody DeliveryProofRequest request,
                               @AuthenticationPrincipal AuthenticatedUser user) {
        return service.saveProof(orderId, request, user);
    }

    @PostMapping("/{driverId}/ratings")
    public DriverRatingResponse rate(@PathVariable String driverId, @RequestParam String orderId,
                                     @Valid @RequestBody DriverRatingRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return service.rate(driverId, orderId, request, user);
    }
}
