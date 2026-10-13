package food_delivery_api.controller;

import food_delivery_api.dto.OrderCreateRequest;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.dto.OrderStatusUpdateRequest;
import food_delivery_api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderCreateRequest request) {
        OrderResponse created = orderService.create(request);
        return ResponseEntity
                .created(URI.create("/api/orders/" + created.id()))
                .body(created);
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable String id) {
        return orderService.getById(id);
    }

    @GetMapping
    public List<OrderResponse> getAll() {
        return orderService.getAll();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<OrderResponse> getByRestaurant(@PathVariable String restaurantId) {
        return orderService.getByRestaurant(restaurantId);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable String id,
                                      @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request);
    }
}
