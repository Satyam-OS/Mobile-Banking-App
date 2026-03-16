package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.entity.KycStatus;
import com.example.bank.auth_service.repository.KycRepository;
import com.example.bank.auth_service.service.AdminKycService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/kyc")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminKycController {

    private final AdminKycService adminKycService;
    private final KycRepository kycRepository;

    @GetMapping("/pending")
    public List<KycApplication> getPendingKycs() {
        return kycRepository.findByStatus(KycStatus.SUBMITTED);
    }

    @PostMapping("/approve/{mobile}")
    public String approve(@PathVariable String mobile) {
        adminKycService.approveKyc(mobile);
        return "KYC APPROVED";
    }

    @PostMapping("/reject/{mobile}")
    public String reject(
            @PathVariable String mobile,
            @RequestParam String reason
    ) {
        adminKycService.rejectKyc(mobile, reason);
        return "KYC REJECTED";
    }
}
