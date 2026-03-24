package com.example.bank.auth_service.dto;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String mobile;
    private String otp;             // Required — verified here on password reset
    private String newPassword;
    private String confirmPassword;
}
