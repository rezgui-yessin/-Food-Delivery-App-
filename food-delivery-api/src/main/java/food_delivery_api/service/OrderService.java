package food_delivery_api.service;

import food_delivery_api.dto.OrderCreateRequest;
import food_delivery_api.dto.OrderItemRequest;
import food_delivery_api.dto.OrderResponse;
import food_delivery_api.dto.OrderStatusUpdateRequest;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.MenuItem;
import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderItem;
import food_delivery_api.modell.OrderStatus;
import food_delivery_api.modell.Restaurant;
import food_delivery_api.repository.MenuItemRepository;
import food_delivery_api.repository.OrderRepository;
import food_delivery_api.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderResponse create(OrderCreateRequest request) {
        // 1. Verify restaurant exists & is open
        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.restaurantId()));

        if (!restaurant.isOpen()) {
            throw new BadRequestException("Restaurant '" + restaurant.getName() + "' is currently closed");
        }

        // 2. Validate menu items and compute prices server-side
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemReq.menuItemId(), request.restaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemReq.menuItemId()));

            if (!menuItem.isAvailable()) {
                throw new BadRequestException("Menu item '" + menuItem.getName() + "' is currently out of stock");
            }

            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subtotal);

            orderItems.add(OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .name(menuItem.getName())
                    .unitPrice(unitPrice)
                    .quantity(itemReq.quantity())
                    .subtotal(subtotal)
                    .build());
        }

        // 3. Persist order
        Order order = Order.builder()
                .restaurantId(request.restaurantId())
                .customerName(request.customerName())
                .customerPhone(request.customerPhone())
                .deliveryAddress(request.deliveryAddress())
                .items(orderItems)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        return OrderResponse.from(orderRepository.save(order));
    }

    public OrderResponse getById(String id) {
        return OrderResponse.from(findOrThrow(id));
    }

    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> getByRestaurant(String restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
        return orderRepository.findByRestaurantId(restaurantId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse updateStatus(String id, OrderStatusUpdateRequest request) {
        Order order = findOrThrow(id);
        order.setStatus(request.status());
        return OrderResponse.from(orderRepository.save(order));
    }

    private Order findOrThrow(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
}
