package com.example.bank.auth_service.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard")
    public ResponseEntity<?> adminDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Admin dashboard accessed"
        ));
    }
}
