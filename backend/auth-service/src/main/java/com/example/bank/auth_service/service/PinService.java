package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Transaction PIN Service
 *
 * Security model:
 *  - PINs are BCrypt-hashed before storage (same as passwords)
 *  - Maximum 5 incorrect attempts before the account is rate-limited for 15 minutes
 *  - PIN must be exactly 4 numeric digits
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PinService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // In-memory attempt tracker: userId → [count, lockoutTimestamp]
    // For production, replace with Redis to survive restarts and support clustering
    private final Map<UUID, int[]> failedAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_MILLIS = 15 * 60 * 1000L; // 15 minutes

    /**
     * Sets (or updates) the transaction PIN for the given user.
     * The raw PIN is validated for format and then BCrypt-hashed before storage.
     */
    public void setPin(UUID userId, String rawPin, String confirmPin) {
        validatePinFormat(rawPin);

        if (!rawPin.equals(confirmPin)) {
            throw new IllegalArgumentException("PIN and confirm PIN do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTransactionPin(passwordEncoder.encode(rawPin));
        userRepository.save(user);

        log.info("Transaction PIN set for userId={}", userId);
    }

    /**
     * Verifies the supplied raw PIN against the stored hash.
     * Returns true if correct, false if wrong.
     * Throws RuntimeException if account is locked out or PIN not set.
     */
    public boolean verifyPin(UUID userId, String rawPin) {
        checkRateLimit(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTransactionPin() == null) {
            throw new RuntimeException("Transaction PIN not set. Please set your PIN in Security Settings.");
        }

        boolean matches = passwordEncoder.matches(rawPin, user.getTransactionPin());

        if (!matches) {
            recordFailedAttempt(userId);
            log.warn("Incorrect PIN attempt for userId={}", userId);
            return false;
        }

        // Clear failed attempts on success
        failedAttempts.remove(userId);
        return true;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void validatePinFormat(String pin) {
        if (pin == null || !pin.matches("\\d{4}")) {
            throw new IllegalArgumentException("PIN must be exactly 4 numeric digits");
        }
    }

    private void checkRateLimit(UUID userId) {
        int[] state = failedAttempts.get(userId);
        if (state == null) return;

        int attempts = state[0];
        long lockoutAt = state[1];

        if (attempts >= MAX_ATTEMPTS) {
            long elapsed = System.currentTimeMillis() - lockoutAt;
            if (elapsed < LOCKOUT_MILLIS) {
                long remainingSeconds = (LOCKOUT_MILLIS - elapsed) / 1000;
                throw new RuntimeException(
                        "Too many incorrect PIN attempts. Try again in " + remainingSeconds + " seconds.");
            } else {
                // Lockout period expired — reset
                failedAttempts.remove(userId);
            }
        }
    }

    private void recordFailedAttempt(UUID userId) {
        failedAttempts.compute(userId, (id, state) -> {
            if (state == null) {
                return new int[]{1, (int) (System.currentTimeMillis() / 1000)};
            }
            state[0]++;
            if (state[0] >= MAX_ATTEMPTS) {
                state[1] = (int) (System.currentTimeMillis() / 1000);
            }
            return state;
        });
    }
}
