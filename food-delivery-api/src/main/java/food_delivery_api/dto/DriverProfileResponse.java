package food_delivery_api.dto;

import food_delivery_api.modell.User;

public record DriverProfileResponse(
        String id, String email, String fullName, String phone, String vehicleType,
        String vehiclePlate, boolean available, Double latitude, Double longitude,
        String deliveryZone, Double rating) {
    public static DriverProfileResponse from(User user) {
        return new DriverProfileResponse(user.getId(), user.getEmail(), user.getFullName(), user.getPhone(),
                user.getVehicleType(), user.getVehiclePlate(), user.isDriverAvailable(),
                user.getCurrentLatitude(), user.getCurrentLongitude(), user.getDeliveryZone(),
                user.getDriverRating());
    }
}
