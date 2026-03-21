package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.PinRequest;
import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import com.example.bank.auth_service.service.PinService;
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
    private final PinService pinService;

    /**
     * Returns real user data (firstName, email, mobile, customerId, role).
     * The X-User-Id header is injected by the API Gateway JWT filter.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {

        if (userIdStr == null || userIdStr.isBlank()) {
            return ResponseEntity.ok(Map.of("message", "User dashboard accessed"));
        }

        try {
            UUID userId = UUID.fromString(userIdStr);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "firstName",       user.getFirstName()  != null ? user.getFirstName()  : "",
                    "email",           user.getEmail()       != null ? user.getEmail()       : "",
                    "mobile",          user.getMobile(),
                    "customerId",      user.getCustomerId()  != null ? user.getCustomerId()  : "",
                    "role",            user.getRole().name(),
                    "hasPinSet",       user.getTransactionPin() != null
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /user/set-pin
     * Sets or updates the 4-digit transaction PIN for the authenticated user.
     * Requires JWT authentication (handled by SecurityConfig + gateway).
     */
    @PostMapping("/set-pin")
    public ResponseEntity<Map<String, String>> setPin(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody PinRequest request) {
        try {
            UUID userId = UUID.fromString(userIdStr);
            pinService.setPin(userId, request.getPin(), request.getConfirmPin());
            return ResponseEntity.ok(Map.of("message", "Transaction PIN set successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /user/verify-pin
     * Verifies the 4-digit transaction PIN.
     * Called internally by transaction-service before allowing a transfer.
     * Returns { "valid": true } or { "valid": false } with appropriate HTTP status.
     *
     * This endpoint is also reachable by the API gateway for the transaction-service
     * to call via internal HTTP (service-to-service).
     */
    @PostMapping("/verify-pin")
    public ResponseEntity<Map<String, Object>> verifyPin(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody PinRequest request) {
        try {
            UUID userId = UUID.fromString(userIdStr);
            boolean valid = pinService.verifyPin(userId, request.getPin());
            if (valid) {
                return ResponseEntity.ok(Map.of("valid", true));
            } else {
                return ResponseEntity.status(401).body(Map.of(
                        "valid", false,
                        "error", "Incorrect transaction PIN"));
            }
        } catch (RuntimeException e) {
            // Covers: user not found, PIN not set, rate-limited
            return ResponseEntity.status(403).body(Map.of(
                    "valid", false,
                    "error", e.getMessage()));
        }
    }
}
