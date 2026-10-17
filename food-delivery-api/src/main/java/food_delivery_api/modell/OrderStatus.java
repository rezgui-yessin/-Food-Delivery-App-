package food_delivery_api.modell;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PLACED,
    PENDING,
    CONFIRMED,
    PREPARING,
    READY_FOR_PICKUP,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            PLACED, EnumSet.of(CONFIRMED, CANCELLED),
            PENDING, EnumSet.of(CONFIRMED, CANCELLED),
            CONFIRMED, EnumSet.of(PREPARING, CANCELLED),
            PREPARING, EnumSet.of(READY_FOR_PICKUP, OUT_FOR_DELIVERY, CANCELLED),
            READY_FOR_PICKUP, EnumSet.of(PICKED_UP, OUT_FOR_DELIVERY, CANCELLED),
            PICKED_UP, EnumSet.of(OUT_FOR_DELIVERY, DELIVERED),
            OUT_FOR_DELIVERY, EnumSet.of(DELIVERED),
            DELIVERED, Collections.emptySet(),
            CANCELLED, Collections.emptySet()
    );

    public boolean canTransitionTo(OrderStatus next) {
        if (next == null) {
            return false;
        }
        return VALID_TRANSITIONS.getOrDefault(this, Collections.emptySet()).contains(next);
    }
}
