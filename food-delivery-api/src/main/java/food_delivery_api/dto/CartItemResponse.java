package food_delivery_api.dto;

import food_delivery_api.modell.CartItem;

import java.math.BigDecimal;

public record CartItemResponse(
        String menuItemId,
        String name,
        BigDecimal unitPrice,
        int quantity,
        String specialInstructions,
        BigDecimal subtotal
) {
    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.getMenuItemId(),
                item.getName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSpecialInstructions(),
                item.getSubtotal()
        );
    }
}
