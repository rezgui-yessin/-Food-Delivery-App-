package food_delivery_api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    // in this class we are creating a bean of type PasswordEncoder that uses the BCryptPasswordEncoder implementation. This bean can be injected into other components of the application to encode and verify passwords securely.
}
