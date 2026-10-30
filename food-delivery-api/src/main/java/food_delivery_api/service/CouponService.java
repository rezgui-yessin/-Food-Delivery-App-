package food_delivery_api.service;

import food_delivery_api.dto.CouponRequest;
import food_delivery_api.dto.CouponResponse;
import food_delivery_api.dto.CouponValidationResponse;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ConflictException;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.Coupon;
import food_delivery_api.modell.DiscountType;
import food_delivery_api.modell.Restaurant;
import food_delivery_api.modell.Role;
import food_delivery_api.repository.CouponRepository;
import food_delivery_api.repository.RestaurantRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final RestaurantRepository restaurantRepository;

    public CouponResponse create(CouponRequest request, AuthenticatedUser user) {
        requireManagePermission(request.restaurantId(), user);

        String normalizedCode = normalizeCode(request.code());
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Coupon code '" + normalizedCode + "' already exists");
        }

        validateDiscount(request.discountType(), request.discountValue());
        Instant startDate = parseDate(request.startDate(), false);
        Instant expiryDate = parseDate(request.expiryDate(), true);
        validateDates(startDate, expiryDate);

        Instant now = Instant.now();
        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .description(request.description())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minOrderAmount(request.minOrderAmount() != null ? request.minOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.maxDiscountAmount())
                .restaurantId(request.restaurantId())
                .startDate(startDate != null ? startDate : now)
                .expiryDate(expiryDate)
                .maxUsageCount(request.maxUsageCount())
                .usageCount(0)
                .active(request.active() != null ? request.active() : true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return CouponResponse.from(couponRepository.save(coupon));
    }

    public List<CouponResponse> getAll(String restaurantId, AuthenticatedUser user) {
        if (user == null || user.role() == Role.CUSTOMER) {
            // Customers see active non-expired coupons
            Instant now = Instant.now();
            List<Coupon> available = new ArrayList<>(couponRepository.findByRestaurantIdIsNull());
            if (restaurantId != null && !restaurantId.isBlank()) {
                available.addAll(couponRepository.findByRestaurantId(restaurantId));
            }
            return available.stream()
                    .filter(c -> c.isActive()
                            && (c.getExpiryDate() == null || c.getExpiryDate().isAfter(now))
                            && (c.getMaxUsageCount() == null || c.getUsageCount() < c.getMaxUsageCount()))
                    .map(CouponResponse::from)
                    .toList();
        }

        if (user.role() == Role.ADMIN) {
            if (restaurantId != null && !restaurantId.isBlank()) {
                return couponRepository.findByRestaurantId(restaurantId).stream()
                        .map(CouponResponse::from)
                        .toList();
            }
            return couponRepository.findAll().stream().map(CouponResponse::from).toList();
        }

        if (user.role() == Role.RESTAURANT_OWNER) {
            List<String> ownedRestaurantIds = restaurantRepository.findByOwnerId(user.id()).stream()
                    .map(Restaurant::getId)
                    .toList();
            List<Coupon> coupons = new ArrayList<>(couponRepository.findByRestaurantIdIn(ownedRestaurantIds));
            coupons.addAll(couponRepository.findByRestaurantIdIsNull());
            return coupons.stream().map(CouponResponse::from).toList();
        }

        return List.of();
    }

    public CouponResponse getById(String id, AuthenticatedUser user) {
        Coupon coupon = findOrThrow(id);
        return CouponResponse.from(coupon);
    }

    public CouponResponse update(String id, CouponRequest request, AuthenticatedUser user) {
        Coupon coupon = findOrThrow(id);
        requireManagePermission(coupon.getRestaurantId(), user);

        String normalizedCode = normalizeCode(request.code());
        if (!normalizedCode.equalsIgnoreCase(coupon.getCode()) && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Coupon code '" + normalizedCode + "' already exists");
        }

        validateDiscount(request.discountType(), request.discountValue());
        Instant startDate = parseDate(request.startDate(), false);
        Instant expiryDate = parseDate(request.expiryDate(), true);
        validateDates(startDate, expiryDate);

        coupon.setCode(normalizedCode);
        coupon.setDescription(request.description());
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinOrderAmount(request.minOrderAmount() != null ? request.minOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(request.maxDiscountAmount());
        coupon.setRestaurantId(request.restaurantId());
        if (startDate != null) {
            coupon.setStartDate(startDate);
        }
        coupon.setExpiryDate(expiryDate);
        coupon.setMaxUsageCount(request.maxUsageCount());
        if (request.active() != null) {
            coupon.setActive(request.active());
        }
        coupon.setUpdatedAt(Instant.now());

        return CouponResponse.from(couponRepository.save(coupon));
    }

    public void delete(String id, AuthenticatedUser user) {
        Coupon coupon = findOrThrow(id);
        requireManagePermission(coupon.getRestaurantId(), user);
        couponRepository.delete(coupon);
    }

    public CouponValidationResponse validate(String code, String restaurantId, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            return new CouponValidationResponse(false, null, null, null, orderAmount, BigDecimal.ZERO, orderAmount, "Coupon code is required");
        }

        String normalizedCode = normalizeCode(code);
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode).orElse(null);
        if (coupon == null) {
            return new CouponValidationResponse(false, normalizedCode, null, null, orderAmount, BigDecimal.ZERO, orderAmount, "Coupon '" + normalizedCode + "' does not exist");
        }

        if (!coupon.isActive()) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Coupon is disabled");
        }

        Instant now = Instant.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Coupon is not yet active");
        }

        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Coupon has expired");
        }

        if (coupon.getMaxUsageCount() != null && coupon.getUsageCount() >= coupon.getMaxUsageCount()) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Coupon usage limit reached");
        }

        if (coupon.getRestaurantId() != null && !coupon.getRestaurantId().equals(restaurantId)) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Coupon is not valid for this restaurant");
        }

        BigDecimal minOrder = coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO;
        if (orderAmount.compareTo(minOrder) < 0) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(), orderAmount, BigDecimal.ZERO, orderAmount, "Minimum order amount of $" + minOrder + " required");
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discount).max(BigDecimal.ZERO);

        return new CouponValidationResponse(
                true,
                normalizedCode,
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                orderAmount,
                discount,
                finalAmount,
                "Coupon applied successfully! Saved $" + discount
        );
    }

    public BigDecimal applyAndRedeemCoupon(String code, String restaurantId, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            return BigDecimal.ZERO;
        }

        CouponValidationResponse validation = validate(code, restaurantId, orderAmount);
        if (!validation.valid()) {
            throw new BadRequestException(validation.message());
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BadRequestException("Coupon not found"));

        coupon.setUsageCount(coupon.getUsageCount() + 1);
        coupon.setUpdatedAt(Instant.now());
        couponRepository.save(coupon);

        return validation.discountAmount();
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        return discount.min(orderAmount).setScale(2, RoundingMode.HALF_UP);
    }

    private Coupon findOrThrow(String id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
    }

    private void requireManagePermission(String restaurantId, AuthenticatedUser user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }
        if (user.role() == Role.ADMIN) {
            return;
        }
        if (user.role() == Role.RESTAURANT_OWNER) {
            if (restaurantId == null || restaurantId.isBlank()) {
                throw new AccessDeniedException("Restaurant owners can only create restaurant-specific coupons");
            }
            boolean isOwner = restaurantRepository.findById(restaurantId)
                    .map(r -> user.id().equals(r.getOwnerId()))
                    .orElse(false);
            if (!isOwner) {
                throw new AccessDeniedException("You are not the owner of restaurant: " + restaurantId);
            }
            return;
        }
        throw new AccessDeniedException("Only admins and restaurant owners can manage coupons");
    }

    private void validateDiscount(DiscountType type, BigDecimal value) {
        if (type == DiscountType.PERCENTAGE) {
            if (value.compareTo(BigDecimal.ZERO) <= 0 || value.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Percentage discount must be between 0.01% and 100%");
            }
        } else {
            if (value.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Fixed discount amount must be greater than 0");
            }
        }
    }

    private void validateDates(Instant start, Instant expiry) {
        if (start != null && expiry != null && expiry.isBefore(start)) {
            throw new BadRequestException("Coupon expiry date cannot be before start date");
        }
    }

    private Instant parseDate(String value, boolean endOfDay) {
        if (value == null || value.isBlank()) return null;
        try {
            return Instant.parse(value);
        } catch (java.time.format.DateTimeParseException ignored) {
            try {
                LocalDate date = LocalDate.parse(value);
                return (endOfDay ? date.plusDays(1).atStartOfDay() : date.atStartOfDay())
                        .toInstant(ZoneOffset.UTC);
            } catch (java.time.format.DateTimeParseException ex) {
                throw new BadRequestException("Invalid coupon date. Use YYYY-MM-DD or an ISO timestamp");
            }
        }
    }

    private String normalizeCode(String code) {
        return code != null ? code.trim().toUpperCase() : "";
    }
}
