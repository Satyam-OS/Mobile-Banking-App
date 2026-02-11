package com.example.bank.auth_service.repository;

import com.example.bank.auth_service.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findTopByMobileOrderByExpiresAtDesc(String mobile);
}
