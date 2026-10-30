package food_delivery_api.service;

import com.mongodb.DuplicateKeyException;
import food_delivery_api.dto.AuthResponse;
import food_delivery_api.dto.LoginRequest;
import food_delivery_api.dto.RegisterRequest;
import food_delivery_api.dto.UserResponse;
import food_delivery_api.exception.BadRequestException;
import food_delivery_api.exception.ConflictException;
import food_delivery_api.exception.InvalidCredentialsException;
import food_delivery_api.modell.Role;
import food_delivery_api.modell.User;
import food_delivery_api.repository.UserRepository;
import food_delivery_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new BadRequestException("Cannot register as ADMIN");
        }

        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role(request.role())
                .createdAt(Instant.now())
                .build();

        try {
            user = userRepository.save(user);
        } catch (DuplicateKeyException e) {
            throw new ConflictException("Email already registered");
        }

        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> u.isActive() && u.isApproved())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), "Bearer", UserResponse.from(user));
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }
}
