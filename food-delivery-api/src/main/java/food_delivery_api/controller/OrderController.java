package food_delivery_api.controller;

import food_delivery_api.dto.OrderCreateRequest;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.dto.OrderStatusUpdateRequest;
import food_delivery_api.modell.OrderStatus;
import food_delivery_api.security.AuthenticatedUser;
import food_delivery_api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderCreateRequest request,
                                                @AuthenticationPrincipal AuthenticatedUser user) {
        OrderResponse created = orderService.create(request, user);
        return ResponseEntity
                .created(URI.create("/api/orders/" + created.id()))
                .body(created);
    }

    @GetMapping("/available-for-pickup")
    public List<OrderResponse> getAvailableForPickup(@AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.getAvailableOrdersForPickup(user);
    }

    @GetMapping("/my-deliveries")
    public List<OrderResponse> getMyDeliveries(@AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.getMyDeliveries(user);
    }

    @PostMapping("/{id}/accept")
    public OrderResponse acceptOrder(@PathVariable String id,
                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.acceptOrder(id, user);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectOrder(@PathVariable String id,
                                             @AuthenticationPrincipal AuthenticatedUser user) {
        orderService.rejectOrder(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{id}/tracking", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter trackOrder(@PathVariable String id,
                                 @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.subscribeToTracking(id, user);
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable String id,
                                 @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.getById(id, user);
    }

    @PostMapping("/{id}/reorder")
    public OrderResponse reorder(@PathVariable String id, @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.reorder(id, user);
    }

    @GetMapping
    public List<OrderResponse> getAll(@RequestParam(required = false) String restaurantId,
                                      @RequestParam(required = false) OrderStatus status,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.getAll(restaurantId, status, user);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<OrderResponse> getByRestaurant(@PathVariable String restaurantId,
                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.getByRestaurant(restaurantId, user);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable String id,
                                      @Valid @RequestBody OrderStatusUpdateRequest request,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return orderService.updateStatus(id, request, user);
    }
}
