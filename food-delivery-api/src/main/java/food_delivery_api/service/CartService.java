package food_delivery_api.service;

import food_delivery_api.dto.CartCheckoutRequest;
import food_delivery_api.dto.CartItemRequest;
import food_delivery_api.dto.CartItemUpdateRequest;
import food_delivery_api.dto.CartResponse;
import food_delivery_api.dto.OrderCreateRequest;
import food_delivery_api.dto.OrderItemRequest;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ConflictException;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.Cart;
import food_delivery_api.modell.CartItem;
import food_delivery_api.modell.MenuItem;
import food_delivery_api.modell.PaymentMethod;
import food_delivery_api.modell.Restaurant;
import food_delivery_api.modell.Role;
import food_delivery_api.repository.CartRepository;
import food_delivery_api.repository.MenuItemRepository;
import food_delivery_api.repository.RestaurantRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final int MAX_QUANTITY_PER_ITEM = 50;

    private final CartRepository cartRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderService orderService;

    public CartResponse getCart(AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);
        refreshCart(cart);
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse addItem(CartItemRequest request, AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);

        MenuItem menuItem = menuItemRepository.findById(request.menuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + request.menuItemId()));

        if (!menuItem.isAvailable()) {
            throw new BadRequestException("Menu item '" + menuItem.getName() + "' is currently unavailable");
        }

        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for menu item: " + menuItem.getId()));

        if (!restaurant.isOpen()) {
            throw new BadRequestException("Restaurant '" + restaurant.getName() + "' is currently closed");
        }

        // Single-restaurant rule check:
        if (cart.getRestaurantId() != null && !cart.getItems().isEmpty() && !cart.getRestaurantId().equals(restaurant.getId())) {
            throw new ConflictException(
                    "Your cart already contains items from '" + cart.getRestaurantName() +
                    "'. Please clear your cart before adding items from another restaurant.");
        }

        cart.setRestaurantId(restaurant.getId());
        cart.setRestaurantName(restaurant.getName());

        String instructions = request.specialInstructions() != null ? request.specialInstructions().trim() : null;

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(menuItem.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existing = existingItemOpt.get();
            int newQuantity = existing.getQuantity() + request.quantity();
            if (newQuantity > MAX_QUANTITY_PER_ITEM) {
                throw new BadRequestException("Total quantity for " + menuItem.getName() + " cannot exceed " + MAX_QUANTITY_PER_ITEM);
            }
            existing.setQuantity(newQuantity);
            existing.setUnitPrice(menuItem.getPrice());
            existing.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
            if (instructions != null && !instructions.isBlank()) {
                existing.setSpecialInstructions(instructions);
            }
        } else {
            BigDecimal subtotal = menuItem.getPrice().multiply(BigDecimal.valueOf(request.quantity()));
            CartItem newItem = CartItem.builder()
                    .menuItemId(menuItem.getId())
                    .name(menuItem.getName())
                    .unitPrice(menuItem.getPrice())
                    .quantity(request.quantity())
                    .specialInstructions(instructions)
                    .subtotal(subtotal)
                    .build();
            cart.getItems().add(newItem);
        }

        recalculateCart(cart);
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse updateItem(String menuItemId, CartItemUpdateRequest request, AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getMenuItemId().equals(menuItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item with id " + menuItemId + " not found in cart"));

        if (request.quantity() <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(request.quantity());
            item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(request.quantity())));
            if (request.specialInstructions() != null) {
                item.setSpecialInstructions(request.specialInstructions().trim());
            }
        }

        if (cart.getItems().isEmpty()) {
            cart.setRestaurantId(null);
            cart.setRestaurantName(null);
        }

        recalculateCart(cart);
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse removeItem(String menuItemId, AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);
        boolean removed = cart.getItems().removeIf(item -> item.getMenuItemId().equals(menuItemId));

        if (!removed) {
            throw new ResourceNotFoundException("Item with id " + menuItemId + " not found in cart");
        }

        if (cart.getItems().isEmpty()) {
            cart.setRestaurantId(null);
            cart.setRestaurantName(null);
        }

        recalculateCart(cart);
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse clearCart(AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cart.setRestaurantId(null);
        cart.setRestaurantName(null);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setUpdatedAt(Instant.now());
        return CartResponse.from(cartRepository.save(cart));
    }

    public OrderResponse checkout(CartCheckoutRequest request, AuthenticatedUser user) {
        Cart cart = getOrCreateCart(user);

        if (cart.getItems().isEmpty() || cart.getRestaurantId() == null) {
            throw new BadRequestException("Your cart is empty. Please add items before checking out.");
        }

        List<OrderItemRequest> orderItems = cart.getItems().stream()
                .map(item -> new OrderItemRequest(item.getMenuItemId(), item.getQuantity(), item.getSpecialInstructions()))
                .toList();

        PaymentMethod paymentMethod = request.paymentMethod() != null ? request.paymentMethod() : PaymentMethod.CARD;

        OrderCreateRequest orderCreateRequest = new OrderCreateRequest(
                cart.getRestaurantId(),
                request.customerName(),
                request.customerPhone(),
                request.deliveryAddress(),
                orderItems,
                request.couponCode(),
                paymentMethod,
                request.scheduledAt()
        );

        OrderResponse placedOrder = orderService.create(orderCreateRequest, user);

        // Clear cart after successful checkout
        cart.getItems().clear();
        cart.setRestaurantId(null);
        cart.setRestaurantName(null);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);

        return placedOrder;
    }

    private Cart getOrCreateCart(AuthenticatedUser user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required to access cart");
        }
        if (user.role() != Role.CUSTOMER && user.role() != Role.ADMIN) {
            throw new AccessDeniedException("Only customers can maintain a shopping cart");
        }

        return cartRepository.findByCustomerId(user.id())
                .orElseGet(() -> Cart.builder()
                        .customerId(user.id())
                        .items(new ArrayList<>())
                        .totalAmount(BigDecimal.ZERO)
                        .updatedAt(Instant.now())
                        .build());
    }

    private void recalculateCart(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            total = total.add(item.getSubtotal());
        }
        cart.setTotalAmount(total);
        cart.setUpdatedAt(Instant.now());
    }

    private void refreshCart(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            cart.setRestaurantId(null);
            cart.setRestaurantName(null);
            cart.setTotalAmount(BigDecimal.ZERO);
            return;
        }

        for (CartItem item : cart.getItems()) {
            menuItemRepository.findById(item.getMenuItemId()).ifPresent(currentMenu -> {
                item.setName(currentMenu.getName());
                item.setUnitPrice(currentMenu.getPrice());
                item.setSubtotal(currentMenu.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            });
        }
        recalculateCart(cart);
    }
}
