package food_delivery_api.repository;

import food_delivery_api.modell.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {}
