package food_delivery_api.service;

import food_delivery_api.dto.*;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.*;
import food_delivery_api.repository.DriverRatingRepository;
import food_delivery_api.repository.OrderRepository;
import food_delivery_api.repository.UserRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {
    private static final BigDecimal BASE_PAYOUT = BigDecimal.valueOf(5.50);
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DriverRatingRepository ratingRepository;

    public DriverProfileResponse getProfile(AuthenticatedUser principal) {
        return DriverProfileResponse.from(requireDriver(principal));
    }

    public DriverProfileResponse updateProfile(DriverProfileRequest request, AuthenticatedUser principal) {
        User user = requireDriver(principal);
        if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName().trim());
        if (request.phone() != null) user.setPhone(request.phone().trim());
        if (request.vehicleType() != null) user.setVehicleType(request.vehicleType().trim());
        if (request.vehiclePlate() != null) user.setVehiclePlate(request.vehiclePlate().trim());
        if (request.deliveryZone() != null) user.setDeliveryZone(request.deliveryZone().trim());
        return DriverProfileResponse.from(userRepository.save(user));
    }

    public DriverProfileResponse setAvailability(boolean available, AuthenticatedUser principal) {
        User user = requireDriver(principal);
        user.setDriverAvailable(available);
        return DriverProfileResponse.from(userRepository.save(user));
    }

    public DriverProfileResponse updateLocation(DriverLocationRequest request, AuthenticatedUser principal) {
        User user = requireDriver(principal);
        user.setCurrentLatitude(request.latitude());
        user.setCurrentLongitude(request.longitude());
        return DriverProfileResponse.from(userRepository.save(user));
    }

    public DriverEarningsResponse getEarnings(AuthenticatedUser principal) {
        List<Order> completed = orderRepository.findByDriverIdOrderByCreatedAtDesc(principal.id()).stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED).toList();
        BigDecimal total = BASE_PAYOUT.multiply(BigDecimal.valueOf(completed.size()));
        return new DriverEarningsResponse(completed.size(), total,
                completed.isEmpty() ? BigDecimal.ZERO : total.divide(BigDecimal.valueOf(completed.size()), 2, java.math.RoundingMode.HALF_UP),
                "USD");
    }

    public OrderResponse saveProof(String orderId, DeliveryProofRequest request, AuthenticatedUser principal) {
        Order order = assignedOrder(orderId, principal);
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new IllegalStateException("Delivery proof can only be submitted while out for delivery");
        }
        order.setDeliveryProofSignature(blankToNull(request.signature()));
        order.setDeliveryProofPhotoUrl(blankToNull(request.photoUrl()));
        order.setDeliveryProofCode(blankToNull(request.verificationCode()));
        order.setDeliveryProofAt(Instant.now());
        return OrderResponse.from(orderRepository.save(order));
    }

    public DriverRatingResponse rate(String driverId, String orderId, DriverRatingRequest request, AuthenticatedUser principal) {
        if (principal == null || principal.role() != Role.CUSTOMER) throw new AccessDeniedException("Only customers can rate drivers");
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!principal.id().equals(order.getCustomerId()) || !driverId.equals(order.getDriverId()) || order.getStatus() != OrderStatus.DELIVERED) {
            throw new AccessDeniedException("You can only rate the driver who delivered your order");
        }
        if (ratingRepository.existsByOrderIdAndCustomerId(orderId, principal.id())) {
            throw new IllegalStateException("This delivery has already been rated");
        }
        DriverRating saved = ratingRepository.save(DriverRating.builder().driverId(driverId).customerId(principal.id())
                .orderId(orderId).rating(request.rating()).comment(request.comment()).build());
        List<DriverRating> ratings = ratingRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
        User driver = userRepository.findById(driverId).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        driver.setDriverRating(ratings.stream().mapToInt(DriverRating::getRating).average().orElse(0));
        userRepository.save(driver);
        return DriverRatingResponse.from(saved);
    }

    private Order assignedOrder(String id, AuthenticatedUser principal) {
        requireDriver(principal);
        Order order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!principal.id().equals(order.getDriverId())) throw new AccessDeniedException("Order is not assigned to this driver");
        return order;
    }

    private User requireDriver(AuthenticatedUser principal) {
        if (principal == null || (principal.role() != Role.DELIVERY_DRIVER && principal.role() != Role.ADMIN)) {
            throw new AccessDeniedException("Only delivery drivers can access this resource");
        }
        return userRepository.findById(principal.id()).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
