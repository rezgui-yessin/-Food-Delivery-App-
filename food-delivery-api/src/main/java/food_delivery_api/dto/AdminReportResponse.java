package food_delivery_api.dto;

import java.math.BigDecimal;

public record AdminReportResponse(long users, long customers, long drivers, long restaurants,
                                  long orders, BigDecimal grossRevenue, BigDecimal commissionRevenue) {}
