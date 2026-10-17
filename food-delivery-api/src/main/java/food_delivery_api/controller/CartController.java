package food_delivery_api.controller;

import food_delivery_api.dto.CartCheckoutRequest;
import food_delivery_api.dto.CartItemRequest;
import food_delivery_api.dto.CartItemUpdateRequest;
import food_delivery_api.dto.CartResponse;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal AuthenticatedUser user) {
        return cartService.getCart(user);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody CartItemRequest request,
                                                @AuthenticationPrincipal AuthenticatedUser user) {
        CartResponse updatedCart = cartService.addItem(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedCart);
    }

    @PutMapping("/items/{menuItemId}")
    public CartResponse updateItem(@PathVariable String menuItemId,
                                   @Valid @RequestBody CartItemUpdateRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser user) {
        return cartService.updateItem(menuItemId, request, user);
    }

    @DeleteMapping("/items/{menuItemId}")
    public CartResponse removeItem(@PathVariable String menuItemId,
                                   @AuthenticationPrincipal AuthenticatedUser user) {
        return cartService.removeItem(menuItemId, user);
    }

    @DeleteMapping
    public CartResponse clearCart(@AuthenticationPrincipal AuthenticatedUser user) {
        return cartService.clearCart(user);
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CartCheckoutRequest request,
                                                  @AuthenticationPrincipal AuthenticatedUser user) {
        OrderResponse createdOrder = cartService.checkout(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }
}
