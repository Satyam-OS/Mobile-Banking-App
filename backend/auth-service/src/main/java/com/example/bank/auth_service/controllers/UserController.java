package com.example.bank.auth_service.controllers;

import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;


    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {


        if (userIdStr == null || userIdStr.isBlank()) {
            return ResponseEntity.ok(Map.of("message", "User dashboard accessed"));
        }

        try {
            UUID userId = UUID.fromString(userIdStr);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "firstName",  user.getFirstName()  != null ? user.getFirstName()  : "",
                    "email",      user.getEmail()       != null ? user.getEmail()       : "",
                    "mobile",     user.getMobile(),
                    "customerId", user.getCustomerId()  != null ? user.getCustomerId()  : "",
                    "role",       user.getRole().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
