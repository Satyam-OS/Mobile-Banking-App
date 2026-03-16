package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.OtpRequest;
import com.example.bank.auth_service.dto.OtpVerifyRequest;
import com.example.bank.auth_service.security.JwtUtil;
import com.example.bank.auth_service.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateOtp(@RequestBody OtpRequest req) {
        otpService.generateAndSendOtp(req.getMobile());
        return ResponseEntity.ok(
                Map.of("message", "OTP generated successfully")
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @RequestBody OtpVerifyRequest req
    ) {
        otpService.verifyOtp(req.getMobile(), req.getOtp());

        String token = jwtUtil.generateKycToken(req.getMobile());

        return ResponseEntity.ok(
                Map.of(
                        "message", "OTP verified. Please submit your KYC to complete registration.",
                        "token", token
                )
        );
    }
}
