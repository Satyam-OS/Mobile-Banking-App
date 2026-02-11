package com.example.bank.auth_service.repository;

import com.example.bank.auth_service.entity.KycApplication;
import com.example.bank.auth_service.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KycRepository extends JpaRepository<KycApplication, String> {

    Optional<KycApplication> findByMobile(String mobile);

    List<KycApplication> findByStatus(KycStatus status);
}
