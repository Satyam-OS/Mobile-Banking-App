package com.banking.transaction.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Internal HTTP client — transaction-service → auth-service.
 *
 * Calls the /internal/verify-pin endpoint which is permit-all in auth-service's
 * SecurityConfig (no JWT required). The endpoint is protected by a shared
 * X-Internal-Secret header so it cannot be called by anyone without the secret.
 *
 * Both services must have the same INTERNAL_SERVICE_SECRET env var set on Render.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    /**
     * Shared secret read from INTERNAL_SERVICE_SECRET env var.
     * Must match the value configured in auth-service.
     */
    @Value("${internal.service.secret:INTERNAL_SECRET_CHANGE_ME}")
    private String internalServiceSecret;

    /**
     * Verifies the user's 4-digit transaction PIN via auth-service.
     * Uses the internal endpoint — no JWT needed, authenticated by shared secret.
     *
     * @param userId UUID string of the user
     * @param pin    Raw 4-digit PIN entered by the user
     * @throws SecurityException if PIN is wrong, not set, or user is rate-limited
     */
    public void verifyTransactionPin(String userId, String pin) {
        // Use the internal endpoint — no JWT, protected by X-Internal-Secret header
        String url = authServiceUrl + "/internal/verify-pin";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Secret", internalServiceSecret);
        headers.set("X-User-Id", userId);

        Map<String, String> body = Map.of("pin", pin);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new SecurityException("Transaction PIN verification failed");
            }

            Object valid = response.getBody() != null ? response.getBody().get("valid") : null;
            if (!Boolean.TRUE.equals(valid)) {
                throw new SecurityException("Incorrect transaction PIN");
            }

            log.info("PIN verified successfully for userId={}", userId);

        } catch (HttpClientErrorException.Unauthorized e) {
            throw new SecurityException("Incorrect transaction PIN");
        } catch (HttpClientErrorException.Forbidden e) {
            // PIN not set, rate-limited, or bad secret
            String msg = extractErrorMessage(e);
            throw new SecurityException(msg);
        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to reach auth-service for PIN verification: {}", e.getMessage());
            throw new RuntimeException("Unable to verify transaction PIN. Please try again.");
        }
    }

    private String extractErrorMessage(HttpClientErrorException e) {
        try {
            String body = e.getResponseBodyAsString();
            if (body.contains("\"error\"")) {
                int start   = body.indexOf("\"error\"") + 9;
                int valStart = body.indexOf("\"", start) + 1;
                int valEnd   = body.indexOf("\"", valStart);
                if (valStart > 0 && valEnd > valStart) {
                    return body.substring(valStart, valEnd);
                }
            }
        } catch (Exception ignored) {}
        return "Transaction PIN verification failed";
    }
}
