package food_delivery_api.dto;

import food_delivery_api.modell.Role;
import food_delivery_api.modell.User;

public record AdminUserResponse(String id, String email, String fullName, String phone, Role role,
                                boolean active, boolean approved, boolean driverAvailable, String vehicleType,
                                String vehiclePlate, String deliveryZone, Double latitude, Double longitude) {
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole(),
                u.isActive(), u.isApproved(), u.isDriverAvailable(), u.getVehicleType(), u.getVehiclePlate(), u.getDeliveryZone(),
                u.getCurrentLatitude(), u.getCurrentLongitude());
    }
}
