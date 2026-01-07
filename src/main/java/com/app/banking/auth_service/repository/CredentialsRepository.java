package com.app.banking.auth_service.repository;

import com.app.banking.auth_service.entity.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CredentialsRepository
        extends JpaRepository<Credentials, Long> {

    Optional<Credentials> findByUsername(String username);
}
