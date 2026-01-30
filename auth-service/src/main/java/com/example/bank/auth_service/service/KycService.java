package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.entity.KycStatus;
import com.example.bank.auth_service.repository.KycRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;

    public void submitKyc(KycApplication req) {


        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthorized KYC submission");
        }

        String mobile = auth.getName();


        KycApplication kyc = kycRepository.findByMobile(mobile)
                .orElse(new KycApplication());


        kyc.setMobile(mobile);

        // PERSONAL
        kyc.setFullName(req.getFullName());
        kyc.setEmail(req.getEmail());
        kyc.setDob(req.getDob());
        kyc.setGender(req.getGender());

        // ADDRESS
        kyc.setAddressLine1(req.getAddressLine1());
        kyc.setCity(req.getCity());
        kyc.setState(req.getState());
        kyc.setPincode(req.getPincode());

        // DOCUMENTS
        kyc.setPanNumber(req.getPanNumber());
        kyc.setAadharNumber(req.getAadharNumber());
        kyc.setPanDocPath(req.getPanDocPath());
        kyc.setAadharFrontPath(req.getAadharFrontPath());
        kyc.setAadharBackPath(req.getAadharBackPath());

        // ACCOUNT
        kyc.setAccountType(req.getAccountType());

        // STATUS
        kyc.setStatus(KycStatus.SUBMITTED);
        kyc.setSubmittedAt(LocalDateTime.now());


        kycRepository.save(kyc);
    }
}
