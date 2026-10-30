package food_delivery_api.dto;

import jakarta.validation.constraints.Size;

public record DriverProfileRequest(
        String fullName,
        String phone,
        @Size(max = 60) String vehicleType,
        @Size(max = 30) String vehiclePlate,
        @Size(max = 100) String deliveryZone
) {}
