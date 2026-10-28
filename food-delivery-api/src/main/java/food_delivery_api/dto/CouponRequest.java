package food_delivery_api.dto;

import food_delivery_api.modell.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponRequest(
        @NotBlank(message = "Coupon code is required")
        @Pattern(regexp = "^[A-Za-z0-9_-]{3,20}$", message = "Coupon code must be 3-20 alphanumeric characters")
        String code,

        String description,

        @NotNull(message = "Discount type is required")
        DiscountType discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
        BigDecimal discountValue,

        @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
        BigDecimal minOrderAmount,

        BigDecimal maxDiscountAmount,

        String restaurantId,

        Instant startDate,

        Instant expiryDate,

        Integer maxUsageCount,

        Boolean active
) {}
