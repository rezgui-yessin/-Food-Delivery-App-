package food_delivery_api.dto;

import food_delivery_api.modell.PlatformSettings;
import java.math.BigDecimal;

public record PlatformSettingsResponse(BigDecimal commissionRate, String currency) {
    public static PlatformSettingsResponse from(PlatformSettings s) {
        return new PlatformSettingsResponse(s.getCommissionRate(), s.getCurrency());
    }
}
