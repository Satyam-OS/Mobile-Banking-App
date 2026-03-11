package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.PasswordResetRequest;
import com.example.bank.auth_service.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody PasswordResetRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }
        passwordResetService.resetPassword(
                request.getMobile(),
                request.getNewPassword()
        );
    }
}