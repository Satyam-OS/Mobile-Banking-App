package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.Otp;
import com.example.bank.auth_service.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;

    //  GENERATE OTP
    public void generateAndSendOtp(String mobile) {

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        Otp record = new Otp();
        record.setId(UUID.randomUUID());
        record.setMobile(mobile);
        record.setOtp(otp);
        record.setVerified(false);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(record);

        //  PRINT OTP
        System.out.println("OTP generated for \"" + mobile + "\": \"" + otp + "\"");
    }

    //  VERIFY OTP
    public void verifyOtp(String mobile, String otp) {

        Otp record = otpRepository
                .findTopByMobileOrderByExpiresAtDesc(mobile)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (record.isVerified()) {
            throw new RuntimeException("OTP already used");
        }

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!record.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        record.setVerified(true);
        otpRepository.save(record);
    }
}
