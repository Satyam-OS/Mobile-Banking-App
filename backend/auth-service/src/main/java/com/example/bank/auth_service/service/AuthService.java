package com.example.bank.auth_service.service;

import com.example.bank.auth_service.dto.LoginRequest;
import com.example.bank.auth_service.dto.LoginResponse;
import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import com.example.bank.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest req) {

        User user = userRepository.findByMobile(req.getMobile())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.isActive())
            throw new RuntimeException("Account inactive");

        if (user.isForcePasswordReset())
            throw new RuntimeException("PASSWORD_RESET_REQUIRED");

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");

        String token = jwtUtil.generateToken(
                user.getCustomerId(),
                String.valueOf(user.getRole())
        );

        return new LoginResponse(token, user.getRole().name(), user.getCustomerId());
    }
}
