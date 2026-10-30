package food_delivery_api.modell;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id private String id;
    private String actorId;
    private String action;
    private String targetType;
    private String targetId;
    private String details;
    @Builder.Default private Instant createdAt = Instant.now();
}
