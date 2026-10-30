package food_delivery_api.modell;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "platform_settings")
public class PlatformSettings {
    @Id private String id;
    @Builder.Default private BigDecimal commissionRate = BigDecimal.valueOf(15);
    @Builder.Default private String currency = "USD";
}
