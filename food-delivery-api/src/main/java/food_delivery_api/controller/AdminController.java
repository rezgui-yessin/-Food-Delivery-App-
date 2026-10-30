package food_delivery_api.controller;

import food_delivery_api.dto.*;
import food_delivery_api.modell.Role;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService service;

    @GetMapping("/users")
    public List<AdminUserResponse> users(@RequestParam(required = false) String query,
                                         @RequestParam(required = false) Role role,
                                         @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.users(query, role, actor);
    }

    @PostMapping("/users")
    public AdminUserResponse createUser(@Valid @RequestBody AdminUserCreateRequest request,
                                        @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.createUser(request, actor);
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse updateUser(@PathVariable String id, @Valid @RequestBody AdminUserUpdateRequest request,
                                        @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.updateUser(id, request, actor);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable String id,
                           @AuthenticationPrincipal AuthenticatedUser actor) {
        service.deleteUser(id, actor);
    }

    @GetMapping("/restaurants")
    public List<RestaurantResponse> restaurants(@AuthenticationPrincipal AuthenticatedUser actor) {
        return service.restaurants(actor);
    }

    @PatchMapping("/restaurants/{id}/approval")
    public RestaurantResponse approveRestaurant(@PathVariable String id, @RequestParam boolean approved,
                                                 @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.approveRestaurant(id, approved, actor);
    }

    @GetMapping("/audit-logs")
    public List<AuditLogResponse> auditLogs(@AuthenticationPrincipal AuthenticatedUser actor) { return service.auditLogs(actor); }

    @GetMapping("/settings")
    public PlatformSettingsResponse settings(@AuthenticationPrincipal AuthenticatedUser actor) { return service.settings(actor); }

    @PutMapping("/settings")
    public PlatformSettingsResponse updateSettings(@Valid @RequestBody PlatformSettingsRequest request,
                                                   @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.updateSettings(request, actor);
    }

    @GetMapping("/reports")
    public AdminReportResponse report(@AuthenticationPrincipal AuthenticatedUser actor) { return service.report(actor); }

    @PostMapping("/orders/{id}/refund")
    public OrderResponse refund(@PathVariable String id, @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.refund(id, actor);
    }
}
