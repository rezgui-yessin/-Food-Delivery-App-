package food_delivery_api.controller;

import food_delivery_api.dto.CouponRequest;
import food_delivery_api.dto.CouponResponse;
import food_delivery_api.dto.CouponValidationResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<CouponResponse> create(@Valid @RequestBody CouponRequest request,
                                                 @AuthenticationPrincipal AuthenticatedUser user) {
        CouponResponse created = couponService.create(request, user);
        return ResponseEntity
                .created(URI.create("/api/coupons/" + created.id()))
                .body(created);
    }

    @GetMapping
    public List<CouponResponse> getAll(@RequestParam(required = false) String restaurantId,
                                       @AuthenticationPrincipal AuthenticatedUser user) {
        return couponService.getAll(restaurantId, user);
    }

    @GetMapping("/validate")
    public CouponValidationResponse validate(@RequestParam String code,
                                             @RequestParam String restaurantId,
                                             @RequestParam BigDecimal amount) {
        return couponService.validate(code, restaurantId, amount);
    }

    @GetMapping("/{id}")
    public CouponResponse getById(@PathVariable String id,
                                  @AuthenticationPrincipal AuthenticatedUser user) {
        return couponService.getById(id, user);
    }

    @PutMapping("/{id}")
    public CouponResponse update(@PathVariable String id,
                                 @Valid @RequestBody CouponRequest request,
                                 @AuthenticationPrincipal AuthenticatedUser user) {
        return couponService.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id,
                       @AuthenticationPrincipal AuthenticatedUser user) {
        couponService.delete(id, user);
    }
}
