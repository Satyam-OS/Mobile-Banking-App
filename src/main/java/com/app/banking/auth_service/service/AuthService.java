package com.app.banking.auth_service.service;

import com.app.banking.auth_service.dto.LoginRequest;
import com.app.banking.auth_service.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
