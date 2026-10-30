package food_delivery_api.service;

import food_delivery_api.dto.*;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.modell.*;
import food_delivery_api.repository.*;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingsRepository settingsRepository;
    private final StripeService stripeService;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserResponse> users(String query, Role role, AuthenticatedUser actor) {
        requireAdmin(actor);
        String normalized = query == null ? "" : query.trim().toLowerCase();
        return userRepository.findAll().stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> normalized.isBlank() || (user.getEmail() != null && user.getEmail().toLowerCase().contains(normalized))
                        || (user.getFullName() != null && user.getFullName().toLowerCase().contains(normalized)))
                .map(AdminUserResponse::from).toList();
    }

    public AdminUserResponse createUser(AdminUserCreateRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new food_delivery_api.exception.ConflictException("Email already registered");
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role(request.role())
                .active(request.active() == null || request.active())
                .approved(request.approved() == null || request.approved())
                .build();
        User saved = userRepository.save(user);
        audit(actor, "USER_CREATED", "USER", saved.getId(), "created by administrator");
        return AdminUserResponse.from(saved);
    }

    public AdminUserResponse updateUser(String id, AdminUserUpdateRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.role() != null) user.setRole(request.role());
        if (request.active() != null) user.setActive(request.active());
        if (request.approved() != null) user.setApproved(request.approved());
        if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName().trim());
        User saved = userRepository.save(user);
        audit(actor, "USER_UPDATED", "USER", id, "role/status changed");
        return AdminUserResponse.from(saved);
    }

    public void deleteUser(String id, AuthenticatedUser actor) {
        requireAdmin(actor);
        if (actor.id().equals(id)) {
            throw new food_delivery_api.exception.BadRequestException("Administrators cannot delete their own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        audit(actor, "USER_DELETED", "USER", id, "deleted by administrator");
    }

    public List<RestaurantResponse> restaurants(AuthenticatedUser actor) {
        requireAdmin(actor);
        return restaurantRepository.findAll().stream().map(RestaurantResponse::from).toList();
    }

    public RestaurantResponse approveRestaurant(String id, boolean approved, AuthenticatedUser actor) {
        requireAdmin(actor);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setApproved(approved);
        restaurant.setOpen(approved && restaurant.isOpen());
        Restaurant saved = restaurantRepository.save(restaurant);
        audit(actor, approved ? "RESTAURANT_APPROVED" : "RESTAURANT_REJECTED", "RESTAURANT", id, null);
        return RestaurantResponse.from(saved);
    }

    public List<AuditLogResponse> auditLogs(AuthenticatedUser actor) {
        requireAdmin(actor);
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc().stream().map(AuditLogResponse::from).toList();
    }

    public PlatformSettingsResponse settings(AuthenticatedUser actor) {
        requireAdmin(actor);
        return PlatformSettingsResponse.from(settingsRepository.findById("platform")
                .orElseGet(() -> settingsRepository.save(PlatformSettings.builder().id("platform").build())));
    }

    public PlatformSettingsResponse updateSettings(PlatformSettingsRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        PlatformSettings settings = settingsRepository.findById("platform")
                .orElse(PlatformSettings.builder().id("platform").build());
        if (request.commissionRate() != null) settings.setCommissionRate(request.commissionRate());
        if (request.currency() != null && !request.currency().isBlank()) settings.setCurrency(request.currency().trim().toUpperCase());
        PlatformSettings saved = settingsRepository.save(settings);
        audit(actor, "PLATFORM_SETTINGS_UPDATED", "SETTINGS", "platform", null);
        return PlatformSettingsResponse.from(saved);
    }

    public AdminReportResponse report(AuthenticatedUser actor) {
        requireAdmin(actor);
        List<User> users = userRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        BigDecimal gross = orders.stream().map(Order::getTotalAmount).filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal rate = settings(actor).commissionRate().divide(BigDecimal.valueOf(100));
        return new AdminReportResponse(users.size(),
                users.stream().filter(u -> u.getRole() == Role.CUSTOMER).count(),
                users.stream().filter(u -> u.getRole() == Role.DELIVERY_DRIVER).count(),
                restaurantRepository.count(), orders.size(), gross, gross.multiply(rate));
    }

    public OrderResponse refund(String orderId, AuthenticatedUser actor) {
        requireAdmin(actor);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("This order has already been refunded");
        }
        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Only paid orders can be refunded");
        }
        if (order.getStripePaymentIntentId() == null) throw new IllegalStateException("Order has no Stripe payment to refund");
        stripeService.refundPayment(order.getStripePaymentIntentId(), order.getTotalAmount());
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        Order saved = orderRepository.save(order);
        audit(actor, "ORDER_REFUNDED", "ORDER", orderId, null);
        return OrderResponse.from(saved);
    }

    private void audit(AuthenticatedUser actor, String action, String type, String target, String details) {
        auditLogRepository.save(AuditLog.builder().actorId(actor.id()).action(action).targetType(type)
                .targetId(target).details(details).build());
    }

    private void requireAdmin(AuthenticatedUser actor) {
        if (actor == null || actor.role() != Role.ADMIN) throw new AccessDeniedException("Admin access required");
    }
}
