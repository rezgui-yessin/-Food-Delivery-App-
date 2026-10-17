package food_delivery_api.dto;

import food_delivery_api.modell.Cart;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CartResponse(
        String id,
        String customerId,
        String restaurantId,
        String restaurantName,
        List<CartItemResponse> items,
        int totalItemCount,
        BigDecimal totalAmount,
        Instant updatedAt
) {
    public static CartResponse from(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems() != null
                ? cart.getItems().stream().map(CartItemResponse::from).toList()
                : List.of();

        int totalCount = cart.getItems() != null
                ? cart.getItems().stream().mapToInt(item -> item.getQuantity()).sum()
                : 0;

        return new CartResponse(
                cart.getId(),
                cart.getCustomerId(),
                cart.getRestaurantId(),
                cart.getRestaurantName(),
                itemResponses,
                totalCount,
                cart.getTotalAmount() != null ? cart.getTotalAmount() : BigDecimal.ZERO,
                cart.getUpdatedAt()
        );
    }
}
