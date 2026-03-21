package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.PasswordResetRequest;
import com.example.bank.auth_service.service.OtpService;
import com.example.bank.auth_service.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;
    private final OtpService otpService;


    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody PasswordResetRequest request) {

        // Validate passwords match before touching the DB
        if (request.getNewPassword() == null || request.getConfirmPassword() == null
                || !request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password and confirm password do not match"));
        }

        if (request.getOtp() == null || request.getOtp().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "OTP is required for password reset"));
        }

        // Step 1: Verify OTP — throws RuntimeException on failure (invalid / expired / used)
        otpService.verifyOtp(request.getMobile(), request.getOtp());

        // Step 2: Reset password (OTP was valid)
        passwordResetService.resetPassword(request.getMobile(), request.getNewPassword());

        return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login with your new password."));
    }
}
