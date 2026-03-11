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

        kyc.setStatus(KycStatus.APPROVED);
        kyc.setReviewedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        if (userRepository.findByMobile(mobile).isPresent()) {
            throw new RuntimeException("User already exists for mobile: " + mobile);
        }

        String customerId = "CUST" + System.currentTimeMillis();

        // ✅ FIX: Copy firstName and email from KYC application into the User record
        // This is what allows the login response and dashboard to show the real name
        User user = User.builder()
                .mobile(mobile)
                .customerId(customerId)
                .password(passwordEncoder.encode("TEMP1234"))
                .role(Role.USER)
                .active(true)
                .forcePasswordReset(true)
                .firstLogin(true)
                .firstName(kyc.getFullName())   // ✅ FIX: was missing before
                .email(kyc.getEmail())           // ✅ FIX: was missing before
                .build();

        User savedUser = userRepository.save(user);

        // ✅ FIX: No longer silent — throws clearly if account creation fails
        // Admin will see the error and can retry the approval
        try {
            createAccountForUser(savedUser.getId());
            System.out.println("✅ USER + ACCOUNT CREATED | Mobile: " + mobile
                    + " | CustomerId: " + customerId
                    + " | Name: " + kyc.getFullName());
        } catch (Exception e) {
            System.err.println("❌ ACCOUNT CREATION FAILED for user " + savedUser.getId()
                    + " (" + mobile + "): " + e.getMessage());
            // Re-throw so admin sees error and can retry
            throw new RuntimeException(
                    "User approved but bank account creation failed. Please retry approval or create account manually. Error: "
                            + e.getMessage(), e);
        }

        System.out.println("✅ KYC APPROVED | Mobile: " + mobile + " | Temp password: TEMP1234");
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

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Account service returned: " + response.getStatusCode());
        }
    }
}
