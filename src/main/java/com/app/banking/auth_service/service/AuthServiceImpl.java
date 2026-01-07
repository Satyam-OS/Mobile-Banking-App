package com.app.banking.auth_service.service;

import com.app.banking.auth_service.dto.LoginRequest;
import com.app.banking.auth_service.dto.LoginResponse;
import com.app.banking.auth_service.security.jwt.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }
    @Override
    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.customerId(),
                                request.password()
                        )
                );

        String token = jwtUtil.generateToken(authentication.getName());

        return new LoginResponse(token);
    }

}
