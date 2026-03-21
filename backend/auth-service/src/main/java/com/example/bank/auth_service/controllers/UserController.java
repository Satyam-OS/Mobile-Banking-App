package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.PinRequest;
import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import com.example.bank.auth_service.service.PinService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PinService pinService;

    /**
     * Value from application.yml / env var INTERNAL_SERVICE_SECRET.
     * Shared between auth-service and transaction-service.
     * Protects the /internal/** endpoints from public access.
     */
    @Value("${internal.service.secret:INTERNAL_SECRET_CHANGE_ME}")
    private String internalServiceSecret;

    // ── Authenticated user endpoints (require JWT via gateway) ──────────────

    /**
     * GET /user/dashboard
     * Returns user profile data. X-User-Id injected by API gateway JWT filter.
     */
    @GetMapping("/user/dashboard")
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
                    "firstName",  user.getFirstName()  != null ? user.getFirstName()  : "",
                    "email",      user.getEmail()       != null ? user.getEmail()       : "",
                    "mobile",     user.getMobile(),
                    "customerId", user.getCustomerId()  != null ? user.getCustomerId()  : "",
                    "role",       user.getRole().name(),
                    "hasPinSet",  user.getTransactionPin() != null
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /user/set-pin
     * Sets the 4-digit transaction PIN. Requires JWT (called by frontend via gateway).
     */
    @PostMapping("/user/set-pin")
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
     * Verifies PIN for the authenticated user (called by frontend directly, requires JWT).
     */
    @PostMapping("/user/verify-pin")
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
            return ResponseEntity.status(403).body(Map.of(
                    "valid", false,
                    "error", e.getMessage()));
        }
    }

    // ── Internal service-to-service endpoint (no JWT, uses shared secret) ──

    /**
     * POST /internal/verify-pin
     *
     * Called by transaction-service to verify a user's PIN before allowing a transfer.
     * This endpoint is permit-all in SecurityConfig (no JWT needed), but protected
     * by the X-Internal-Secret header which must match the shared secret configured
     * in both services via the INTERNAL_SERVICE_SECRET environment variable.
     *
     * This avoids the need for transaction-service to hold a JWT token.
     *
     * Request headers:
     *   X-Internal-Secret: <shared secret>
     *   X-User-Id: <UUID of the user>
     *
     * Request body: { "pin": "1234" }
     */
    @PostMapping("/internal/verify-pin")
    public ResponseEntity<Map<String, Object>> verifyPinInternal(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr,
            @RequestBody PinRequest request) {

        // Validate the internal secret
        if (secret == null || !secret.equals(internalServiceSecret)) {
            return ResponseEntity.status(403).body(Map.of(
                    "valid", false,
                    "error", "Forbidden: invalid internal secret"));
        }

        if (userIdStr == null || userIdStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "error", "X-User-Id header is required"));
        }

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
            return ResponseEntity.status(403).body(Map.of(
                    "valid", false,
                    "error", e.getMessage()));
        }
    }
}
