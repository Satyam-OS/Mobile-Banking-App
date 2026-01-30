package com.example.bank.auth_service.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String mobile;
    private String otp;
}
