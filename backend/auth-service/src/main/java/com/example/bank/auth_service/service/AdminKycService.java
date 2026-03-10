package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.entity.KycStatus;
import com.example.bank.auth_service.entity.Role;
import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.KycRepository;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminKycService {

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @Value("${account.service.url:http://localhost:8082}")
    private String accountServiceUrl;

    @Transactional
    public void approveKyc(String mobile) {

        KycApplication kyc = kycRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("KYC not found for mobile: " + mobile));

        if (kyc.getStatus() != KycStatus.SUBMITTED) {
            throw new RuntimeException("KYC is not in SUBMITTED state. Current state: " + kyc.getStatus());
        }

        // Mark KYC approved
        kyc.setStatus(KycStatus.APPROVED);
        kyc.setReviewedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        // Prevent duplicate user
        if (userRepository.findByMobile(mobile).isPresent()) {
            throw new RuntimeException("User already exists for mobile: " + mobile);
        }

        // Create user — temp password, force reset on first login
        String customerId = "CUST" + System.currentTimeMillis();
        User user = User.builder()
                .mobile(mobile)
                .customerId(customerId)
                .password(passwordEncoder.encode("TEMP1234"))
                .role(Role.USER)
                .active(true)
                .forcePasswordReset(true)
                .firstLogin(true)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create bank account in account-service
        try {
            createAccountForUser(savedUser.getId());
        } catch (Exception e) {
            System.err.println("WARNING: Failed to auto-create account for user " + savedUser.getId() + ": " + e.getMessage());
        }

        System.out.println("✅ USER CREATED | Mobile: " + mobile + " | CustomerId: " + customerId + " | Temp password: TEMP1234");
    }

    @Transactional
    public void rejectKyc(String mobile, String reason) {

        KycApplication kyc = kycRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("KYC not found for mobile: " + mobile));

        if (kyc.getStatus() != KycStatus.SUBMITTED) {
            throw new RuntimeException("KYC is not in SUBMITTED state. Current state: " + kyc.getStatus());
        }

        kyc.setStatus(KycStatus.REJECTED);
        kyc.setRejectionReason(reason);
        kyc.setReviewedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        System.out.println("❌ KYC REJECTED | Mobile: " + mobile + " | Reason: " + reason);
    }

    private void createAccountForUser(UUID userId) {
        String url = accountServiceUrl + "/account/internal/create";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("✅ Account created for user: " + userId);
        } else {
            throw new RuntimeException("Account creation failed with status: " + response.getStatusCode());
        }
    }
}
