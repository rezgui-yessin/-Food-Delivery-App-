package food_delivery_api.modell;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "driver_ratings")
public class DriverRating {
    @Id
    private String id;
    private String driverId;
    private String customerId;
    private String orderId;
    private int rating;
    private String comment;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
