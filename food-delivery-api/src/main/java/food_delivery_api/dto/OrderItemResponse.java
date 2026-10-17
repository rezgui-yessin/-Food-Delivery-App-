package food_delivery_api.dto;

import food_delivery_api.modell.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        String menuItemId,
        String name,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal,
        String specialInstructions
) {
    public OrderItemResponse(String menuItemId, String name, BigDecimal unitPrice, int quantity, BigDecimal subtotal) {
        this(menuItemId, name, unitPrice, quantity, subtotal, null);
    }

    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getMenuItemId(),
                item.getName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSubtotal(),
                item.getSpecialInstructions()
        );
    }
}
