package com.example.bank.auth_service.repository;

import com.example.bank.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByCustomerId(String customerId);
    Optional<User> findByMobile(String mobile);
}
