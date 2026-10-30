package food_delivery_api.repository;

import food_delivery_api.modell.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop100ByOrderByCreatedAtDesc();
}
