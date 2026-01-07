package com.app.banking.auth_service.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    @Override
    public void sendOtp(String phone) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        otpStore.put(phone, otp);
        System.out.println("OTP for " + phone + " = " + otp);
    }

    @Override
    public String verifyOtp(String phone, String otp) {
        if (!otp.equals(otpStore.get(phone))) {
            throw new RuntimeException("Invalid OTP");
        }
        otpStore.remove(phone);
        return phone;
    }
}
