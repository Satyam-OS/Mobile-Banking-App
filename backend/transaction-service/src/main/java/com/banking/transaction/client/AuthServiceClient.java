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
 * Internal HTTP client used by transaction-service to call auth-service.
 *
 * The verify-pin endpoint on auth-service requires X-User-Id header
 * (same as all authenticated routes — the gateway would inject it for
 * external calls, but for internal service-to-service we inject it directly).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    /**
     * Verifies a user's 4-digit transaction PIN by calling auth-service.
     *
     * @param userId UUID string of the user (from X-User-Id header)
     * @param pin    Raw 4-digit PIN entered by user
     * @throws SecurityException if PIN is wrong, not set, or user is rate-limited
     */
    public void verifyTransactionPin(String userId, String pin) {
        String url = authServiceUrl + "/user/verify-pin";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Inject X-User-Id so auth-service can identify the user
        headers.set("X-User-Id", userId);

        Map<String, String> body = Map.of("pin", pin);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new SecurityException("Transaction PIN verification failed");
            }

            Object valid = response.getBody() != null ? response.getBody().get("valid") : null;
            if (!Boolean.TRUE.equals(valid)) {
                throw new SecurityException("Incorrect transaction PIN");
            }

        } catch (HttpClientErrorException.Unauthorized e) {
            throw new SecurityException("Incorrect transaction PIN");
        } catch (HttpClientErrorException.Forbidden e) {
            // Covers: PIN not set, rate-limited
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
            // Response body is JSON like { "error": "..." }
            String body = e.getResponseBodyAsString();
            // Simple extraction without importing Jackson here
            if (body.contains("\"error\"")) {
                int start = body.indexOf("\"error\"") + 9;
                int valueStart = body.indexOf("\"", start) + 1;
                int valueEnd = body.indexOf("\"", valueStart);
                if (valueStart > 0 && valueEnd > valueStart) {
                    return body.substring(valueStart, valueEnd);
                }
            }
        } catch (Exception ignored) {}
        return "Transaction PIN verification failed";
    }
}
