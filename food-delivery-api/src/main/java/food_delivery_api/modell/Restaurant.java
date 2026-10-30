package food_delivery_api.modell;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "restaurants")
@CompoundIndex(name = "owner_open_idx", def = "{'ownerId': 1, 'open': 1}")
public class Restaurant {
    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String name;
    private String description;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String cuisineType;
    private boolean open;
    @Builder.Default
    private boolean approved = true;
    private String imageUrl;
    private String imagePublicId;
    private java.util.Map<String, String> openingHours;
    @Builder.Default
    private double rating = 0;
    @Builder.Default
    private int deliveryTimeMin = 30;
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.valueOf(2.99);
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.valueOf(8.25);
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.valueOf(15);

}
