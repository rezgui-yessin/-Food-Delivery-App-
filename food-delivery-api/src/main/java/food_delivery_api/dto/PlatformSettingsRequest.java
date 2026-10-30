package food_delivery_api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record PlatformSettingsRequest(@DecimalMin("0") @DecimalMax("100") BigDecimal commissionRate,
                                      String currency) {}
