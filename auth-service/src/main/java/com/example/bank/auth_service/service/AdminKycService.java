package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.entity.KycStatus;
import com.example.bank.auth_service.entity.Role;
import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.KycRepository;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminKycService {

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void approveKyc(String mobile) {

        //  Fetch KYC
        KycApplication kyc = kycRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        // Validate state
        if (kyc.getStatus() != KycStatus.SUBMITTED) {
            throw new RuntimeException("KYC already processed");
        }

        //  Approve KYC
        kyc.setStatus(KycStatus.APPROVED);
        kyc.setReviewedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        // Prevent duplicate user creation
        if (userRepository.findByMobile(mobile).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        //  Create user with TEMP password
        User user = User.builder()
                .mobile(mobile)
                .customerId("CUST" + System.currentTimeMillis())
                .password(passwordEncoder.encode("TEMP1234"))
                .role(Role.USER)
                .active(true)
                .forcePasswordReset(true)
                .firstLogin(true)
                .build();

        userRepository.save(user);

        //  Console log for testing
        System.out.println(
                "USER CREATED | Mobile: " + mobile + " | TEMP PASSWORD: TEMP1234"
        );
    }

    @Transactional
    public void rejectKyc(String mobile, String reason) {

        KycApplication kyc = kycRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        if (kyc.getStatus() != KycStatus.SUBMITTED) {
            throw new RuntimeException("KYC already processed");
        }

        kyc.setStatus(KycStatus.REJECTED);
        kyc.setRejectionReason(reason);
        kyc.setReviewedAt(LocalDateTime.now());

        kycRepository.save(kyc);
    }
}
