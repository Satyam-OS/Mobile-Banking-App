package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.PasswordResetRequest;
import com.example.bank.auth_service.service.OtpService;
import com.example.bank.auth_service.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;
    private final OtpService            otpService;

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody PasswordResetRequest request) {

        // Validate OTP is provided
        if (request.getOtp() == null || request.getOtp().isBlank()) {
            throw new IllegalArgumentException("OTP is required for password reset");
        }

        // Validate passwords match before touching the DB
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        // Verify OTP — throws RuntimeException if invalid/expired/already used
        otpService.verifyOtp(request.getMobile(), request.getOtp());

        // Reset password
        passwordResetService.resetPassword(
                request.getMobile(),
                request.getNewPassword()
        );
    }
}
