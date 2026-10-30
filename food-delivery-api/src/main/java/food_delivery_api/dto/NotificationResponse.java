package food_delivery_api.dto;

import food_delivery_api.modell.Notification;

import java.time.Instant;

public record NotificationResponse(String id, String title, String message, String type,
                                   String referenceId, boolean read, Instant createdAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.getType(), notification.getReferenceId(), notification.isRead(), notification.getCreatedAt());
    }
}
