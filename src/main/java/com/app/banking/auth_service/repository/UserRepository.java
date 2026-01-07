package com.app.banking.auth_service.repository;

import com.app.banking.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByCustomerId(String customerId);

    Optional<User> findByPhone(String phone);
}
