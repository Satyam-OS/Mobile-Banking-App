package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/kyc")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class KycController {

    private final KycService kycService;

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody KycApplication req) {
        System.out.println("KYC CONTROLLER HIT");
        kycService.submitKyc(req);
        return ResponseEntity.ok("KYC SUBMITTED");
    }
}
