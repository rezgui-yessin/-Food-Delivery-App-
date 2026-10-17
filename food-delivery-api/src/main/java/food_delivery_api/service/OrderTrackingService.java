package food_delivery_api.service;

import food_delivery_api.dto.OrderTrackingEvent;
import food_delivery_api.modell.Order;
import food_delivery_api.modell.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class OrderTrackingService {

    private static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L; // 30 minutes

    private final Map<String, List<SseEmitter>> orderEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String orderId, Order currentOrder) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        orderEmitters.computeIfAbsent(orderId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> removeEmitter(orderId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Send initial current status immediately upon connecting
        try {
            OrderTrackingEvent initialEvent = OrderTrackingEvent.from(
                    currentOrder,
                    "Connected to real-time tracking for order " + orderId
            );
            emitter.send(SseEmitter.event()
                    .name("order-status")
                    .data(initialEvent));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE tracking event for order {}", orderId, e);
            removeEmitter(orderId, emitter);
        }

        return emitter;
    }

    public void notifyStatusUpdate(Order order, String message) {
        String orderId = order.getId();
        List<SseEmitter> emitters = orderEmitters.get(orderId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        OrderTrackingEvent event = OrderTrackingEvent.from(order, message);
        boolean isTerminal = order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED;

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("order-status")
                        .data(event));

                if (isTerminal) {
                    emitter.complete();
                }
            } catch (IOException | IllegalStateException e) {
                log.debug("Removing dead emitter for order {}: {}", orderId, e.getMessage());
                removeEmitter(orderId, emitter);
            }
        }

        if (isTerminal) {
            orderEmitters.remove(orderId);
        }
    }

    private void removeEmitter(String orderId, SseEmitter emitter) {
        List<SseEmitter> emitters = orderEmitters.get(orderId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                orderEmitters.remove(orderId);
            }
        }
    }
}
