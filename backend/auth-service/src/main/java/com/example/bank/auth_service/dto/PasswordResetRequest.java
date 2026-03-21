package com.example.bank.auth_service.dto;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String mobile;
    private String otp;           // OTP entered by user for password reset flow
    private String newPassword;
    private String confirmPassword;
}
