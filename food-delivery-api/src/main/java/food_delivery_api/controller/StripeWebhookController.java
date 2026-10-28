package food_delivery_api.controller;

import food_delivery_api.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeService stripeService;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Missing Stripe-Signature header in webhook request");
            return ResponseEntity.badRequest().body("Missing Stripe-Signature header");
        }

        stripeService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok("Webhook received successfully");
    }
}
