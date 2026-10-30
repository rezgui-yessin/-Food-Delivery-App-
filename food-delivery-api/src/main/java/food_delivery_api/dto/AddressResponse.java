package food_delivery_api.dto;

import food_delivery_api.modell.Address;

public record AddressResponse(String id, String label, String street, String city, String postalCode, Double latitude, Double longitude, boolean isDefault) {
    public static AddressResponse from(Address address) {
        return new AddressResponse(address.getId(), address.getLabel(), address.getStreet(), address.getCity(),
                address.getPostalCode(),                 address.getLatitude(), address.getLongitude(), address.isDefault());
    }
}
