package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.dto.LoginRequest;
import com.example.bank.auth_service.dto.LoginResponse;
import com.example.bank.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
