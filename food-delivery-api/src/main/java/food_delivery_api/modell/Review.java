package food_delivery_api.modell;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(name = "customer_restaurant_unique", def = "{'customerId': 1, 'restaurantId': 1}", unique = true)
public class Review {
    @Id
    private String id;
    private String restaurantId;
    private String customerId;
    private String customerName;
    private int rating;
    private String comment;
    @Builder.Default
    private Instant createdAt = Instant.now();
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
