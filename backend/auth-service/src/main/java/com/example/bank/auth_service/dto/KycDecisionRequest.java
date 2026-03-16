package com.example.bank.auth_service.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class KycDecisionRequest {

    private UUID kycId;
    private String decision;
}
