package com.app.banking.auth_service.controller;

import com.app.banking.auth_service.dto.LoginRequest;
import com.app.banking.auth_service.dto.LoginResponse;
import com.app.banking.auth_service.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
