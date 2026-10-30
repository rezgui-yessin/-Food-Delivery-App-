package food_delivery_api.modell;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    private String id;
    private String label;
    private String street;
    private String city;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private boolean isDefault;
}
