package com.example.bank.auth_service.service;

import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void resetPassword(String mobile, String newPassword) {

        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForcePasswordReset(false);
        user.setFirstLogin(false);

        userRepository.save(user);
    }
}
