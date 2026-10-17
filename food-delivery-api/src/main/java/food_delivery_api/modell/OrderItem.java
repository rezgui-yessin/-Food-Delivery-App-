package food_delivery_api.modell;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String menuItemId;
    private String name ;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal subtotal;
    private String specialInstructions;
}
