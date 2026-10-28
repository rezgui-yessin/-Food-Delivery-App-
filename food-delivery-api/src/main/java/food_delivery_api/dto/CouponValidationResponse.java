package food_delivery_api.dto;

import food_delivery_api.modell.DiscountType;

import java.math.BigDecimal;

public record CouponValidationResponse(
        boolean valid,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal originalAmount,
        BigDecimal discountAmount,
        BigDecimal finalAmount,
        String message
) {}
