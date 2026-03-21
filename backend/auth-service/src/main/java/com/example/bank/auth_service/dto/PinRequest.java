package com.example.bank.auth_service.dto;

import lombok.Data;

@Data
public class PinRequest {
    /** The raw 4-digit PIN entered by the user. */
    private String pin;
    /** Required only on set-pin — must match pin. */
    private String confirmPin;
}
