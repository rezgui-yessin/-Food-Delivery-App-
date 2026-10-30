package food_delivery_api.dto;

import java.math.BigDecimal;

public record DriverEarningsResponse(long completedDeliveries, BigDecimal totalEarnings,
                                     BigDecimal averageEarnings, String currency) {}
