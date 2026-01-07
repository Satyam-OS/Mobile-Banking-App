package com.app.banking.auth_service.service;

public interface OtpService {
    void sendOtp(String phone);
    String verifyOtp(String phone, String otp);
}
