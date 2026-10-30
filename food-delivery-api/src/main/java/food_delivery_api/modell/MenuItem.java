package food_delivery_api.modell;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menu_items")
public class MenuItem {
    @Id
    private  String id ;
    @Indexed
    private String restaurantId;
    private String name;
    private String description;
    private String imageUrl;
    private String imagePublicId;

    private BigDecimal price;
    private  String category;
    private  boolean available;
    private int stockQuantity;
    private int preparationTimeMinutes;
    private int sortOrder;
}
