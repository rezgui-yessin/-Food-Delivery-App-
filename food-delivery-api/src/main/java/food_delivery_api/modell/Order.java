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
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
@CompoundIndex(name = "driver_status_created_idx", def = "{'driverId': 1, 'status': 1, 'createdAt': -1}")
@CompoundIndex(name = "restaurant_created_idx", def = "{'restaurantId': 1, 'createdAt': -1}")
public class Order {
    @Id
    private String id;
    @Indexed
    private String restaurantId;
    @Indexed
    private String customerId;
    private String customerName;
    private String customerPhone;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Double restaurantLatitude;
    private Double restaurantLongitude;

    private List<OrderItem> items;
    private String couponCode;
    private BigDecimal subtotalAmount;
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal totalAmount;
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal commissionAmount = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    private Integer estimatedDeliveryMinutes;
    private Instant scheduledAt;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CARD;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Indexed
    private String stripePaymentIntentId;

    private String stripeClientSecret;

    @Indexed
    private String driverId;
    private String driverName;
    private String driverPhone;

    @Builder.Default
    private OrderStatus status = OrderStatus.PLACED;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
    private String deliveryProofSignature;
    private String deliveryProofPhotoUrl;
    private String deliveryProofCode;
    private Instant deliveryProofAt;
}
