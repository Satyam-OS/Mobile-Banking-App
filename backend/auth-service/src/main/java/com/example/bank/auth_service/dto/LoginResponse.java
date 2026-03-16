package com.example.bank.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String role;
    private String customerId;
    private boolean forcePasswordReset;
    private String firstName;
    private String email;
}
