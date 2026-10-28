package food_delivery_api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI foodDeliveryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Food Delivery Platform API")
                        .description("Production-ready Food Delivery REST API featuring JWT Authentication, " +
                                "Role-Based Access Control, Single-Restaurant Cart Management, " +
                                "Stripe Payments & Webhooks, and Real-Time SSE Order Tracking.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("yessin-rezgui")
                                .url("https://github.com/yessin-rezgui"))
                        .license(new License()
                                .name("Proprietary / Commercial License")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token to authorize requests. Example: 'eyJhbGci...'")));
    }
}

