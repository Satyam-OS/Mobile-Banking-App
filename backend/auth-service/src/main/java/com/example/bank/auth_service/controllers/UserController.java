package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * FIX: Previously returned a static "dashboard accessed" message.
     * Now returns real user data using the X-User-Id header injected by the API Gateway.
     *
     * The gateway JWT filter extracts the UUID from the Bearer token and injects it
     * as the X-User-Id header before forwarding to this service.
     *
     * The /auth/user/** route in application.yml must have JwtAuthenticationFilter applied
     * (see api-gateway application.yml fix) so this header is always present.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        // Fallback if called without gateway (e.g. direct service call in dev)
        if (userIdStr == null || userIdStr.isBlank()) {
            return ResponseEntity.ok(Map.of("message", "User dashboard accessed"));
        }

        try {
            UUID userId = UUID.fromString(userIdStr);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "firstName",  user.getFirstName()  != null ? user.getFirstName()  : "",
                    "email",      user.getEmail()       != null ? user.getEmail()       : "",
                    "mobile",     user.getMobile(),
                    "customerId", user.getCustomerId()  != null ? user.getCustomerId()  : "",
                    "role",       user.getRole().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
