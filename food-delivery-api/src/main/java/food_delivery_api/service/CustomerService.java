package food_delivery_api.service;

import food_delivery_api.dto.*;
import food_delivery_api.exception.ResourceNotFoundException;
import food_delivery_api.modell.*;
import food_delivery_api.repository.NotificationRepository;
import food_delivery_api.repository.RestaurantRepository;
import food_delivery_api.repository.ReviewRepository;
import food_delivery_api.repository.UserRepository;
import food_delivery_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;

    public UserResponse updateProfile(ProfileUpdateRequest request, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone() == null ? "" : request.phone().trim());
        return UserResponse.from(userRepository.save(user));
    }

    public List<AddressResponse> getAddresses(AuthenticatedUser principal) {
        return requireCustomer(principal).getAddresses().stream().map(AddressResponse::from).toList();
    }

    public AddressResponse addAddress(AddressRequest request, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        if (request.isDefault()) {
            user.getAddresses().forEach(address -> address.setDefault(false));
        }
        Address address = Address.builder().id(UUID.randomUUID().toString()).label(request.label().trim())
                .street(request.street().trim()).city(request.city().trim()).postalCode(request.postalCode().trim())
                .latitude(request.latitude()).longitude(request.longitude())
                .isDefault(request.isDefault() || user.getAddresses().isEmpty()).build();
        user.getAddresses().add(address);
        userRepository.save(user);
        return AddressResponse.from(address);
    }

    public AddressResponse updateAddress(String id, AddressRequest request, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        Address address = user.getAddresses().stream().filter(item -> item.getId().equals(id))
                .findFirst().orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (request.isDefault()) {
            user.getAddresses().forEach(item -> item.setDefault(false));
        }
        address.setLabel(request.label().trim());
        address.setStreet(request.street().trim());
        address.setCity(request.city().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());
        address.setDefault(request.isDefault());
        userRepository.save(user);
        return AddressResponse.from(address);
    }

    public void deleteAddress(String id, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        boolean removed = user.getAddresses().removeIf(address -> address.getId().equals(id));
        if (!removed) throw new ResourceNotFoundException("Address not found");
        if (!user.getAddresses().isEmpty() && user.getAddresses().stream().noneMatch(Address::isDefault)) {
            user.getAddresses().get(0).setDefault(true);
        }
        userRepository.save(user);
    }

    public List<RestaurantResponse> getFavorites(AuthenticatedUser principal) {
        return requireCustomer(principal).getFavoriteRestaurantIds().stream()
                .map(restaurantRepository::findById).flatMap(java.util.Optional::stream)
                .map(RestaurantResponse::from).toList();
    }

    public boolean toggleFavorite(String restaurantId, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        if (!restaurantRepository.existsById(restaurantId)) throw new ResourceNotFoundException("Restaurant not found");
        boolean added;
        if (user.getFavoriteRestaurantIds().contains(restaurantId)) {
            user.getFavoriteRestaurantIds().remove(restaurantId);
            added = false;
        } else {
            user.getFavoriteRestaurantIds().add(restaurantId);
            added = true;
        }
        userRepository.save(user);
        return added;
    }

    public List<ReviewResponse> getReviews(String restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream().map(ReviewResponse::from).toList();
    }

    public ReviewResponse saveReview(String restaurantId, ReviewRequest request, AuthenticatedUser principal) {
        User user = requireCustomer(principal);
        if (!restaurantRepository.existsById(restaurantId)) throw new ResourceNotFoundException("Restaurant not found");
        Review review = reviewRepository.findByRestaurantIdAndCustomerId(restaurantId, user.getId())
                .orElseGet(() -> Review.builder().restaurantId(restaurantId).customerId(user.getId())
                        .customerName(user.getFullName()).createdAt(Instant.now()).build());
        review.setCustomerName(user.getFullName());
        review.setRating(request.rating());
        review.setComment(request.comment().trim());
        review.setUpdatedAt(Instant.now());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    public List<NotificationResponse> getNotifications(AuthenticatedUser principal) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(requireCustomer(principal).getId())
                .stream().map(NotificationResponse::from).toList();
    }

    public void markNotificationRead(String id, AuthenticatedUser principal) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUserId().equals(requireCustomer(principal).getId())) throw new AccessDeniedException("Not allowed");
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private User requireCustomer(AuthenticatedUser principal) {
        if (principal == null) throw new AccessDeniedException("Authentication required");
        User user = userRepository.findById(principal.id()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getAddresses() == null) user.setAddresses(new ArrayList<>());
        if (user.getFavoriteRestaurantIds() == null) user.setFavoriteRestaurantIds(new ArrayList<>());
        return user;
    }
}
