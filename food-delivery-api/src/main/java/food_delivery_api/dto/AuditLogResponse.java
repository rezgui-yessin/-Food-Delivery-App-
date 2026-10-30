package food_delivery_api.dto;

import food_delivery_api.modell.AuditLog;
import java.time.Instant;

public record AuditLogResponse(String id, String actorId, String action, String targetType,
                               String targetId, String details, Instant createdAt) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(log.getId(), log.getActorId(), log.getAction(), log.getTargetType(),
                log.getTargetId(), log.getDetails(), log.getCreatedAt());
    }
}
