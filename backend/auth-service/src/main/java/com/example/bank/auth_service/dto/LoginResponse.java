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
    //  FIX: Added name fields so frontend can display user name instead of mobile number
    private String firstName;
    private String email;
}
