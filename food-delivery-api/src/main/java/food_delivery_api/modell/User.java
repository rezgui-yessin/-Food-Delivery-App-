package food_delivery_api.modell;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private  String id ;

    @Indexed(unique = true)
    private String email;
    private String passwordHash;
    private String  fullName;
    private String phone;
    private Role role;
    @Builder.Default
    private boolean active = true;
    @Builder.Default
    private boolean approved = true;
    private String vehicleType;
    private String vehiclePlate;
    @Builder.Default
    private boolean driverAvailable = false;
    private Double currentLatitude;
    private Double currentLongitude;
    private String deliveryZone;
    @Builder.Default
    private Double driverRating = 0d;
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();
    @Builder.Default
    private List<String> favoriteRestaurantIds = new ArrayList<>();
    @Builder.Default
    private Instant createdAt = Instant.now();
}
