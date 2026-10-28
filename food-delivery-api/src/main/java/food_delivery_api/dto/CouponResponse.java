package food_delivery_api.dto;

import food_delivery_api.modell.Coupon;
import food_delivery_api.modell.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponResponse(
        String id,
        String code,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        String restaurantId,
        Instant startDate,
        Instant expiryDate,
        Integer maxUsageCount,
        int usageCount,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static CouponResponse from(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO,
                coupon.getMaxDiscountAmount(),
                coupon.getRestaurantId(),
                coupon.getStartDate(),
                coupon.getExpiryDate(),
                coupon.getMaxUsageCount(),
                coupon.getUsageCount(),
                coupon.isActive(),
                coupon.getCreatedAt(),
                coupon.getUpdatedAt()
        );
    }
}
