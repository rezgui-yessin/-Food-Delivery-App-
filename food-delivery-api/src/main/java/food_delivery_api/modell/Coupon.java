package food_delivery_api.modell;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupons")
public class Coupon {
    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String description;

    private DiscountType discountType;

    private BigDecimal discountValue;

    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    private BigDecimal maxDiscountAmount;

    @Indexed
    private String restaurantId;

    private Instant startDate;

    private Instant expiryDate;

    private Integer maxUsageCount;

    @Builder.Default
    private int usageCount = 0;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
