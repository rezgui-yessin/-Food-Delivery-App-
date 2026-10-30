package food_delivery_api.controller;

import food_delivery_api.dto.ReviewRequest;
import food_delivery_api.dto.ReviewResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final CustomerService customerService;

    @GetMapping
    public List<ReviewResponse> getReviews(@PathVariable String restaurantId) {
        return customerService.getReviews(restaurantId);
    }

    @PostMapping
    public ReviewResponse saveReview(@PathVariable String restaurantId, @Valid @RequestBody ReviewRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return customerService.saveReview(restaurantId, request, user);
    }
}
