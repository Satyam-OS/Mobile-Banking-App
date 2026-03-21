package com.example.bank.auth_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String mobile;

    @Column(unique = true)
    private String customerId;

    private String password;

    @Column
    private String firstName;

    @Column
    private String email;

    /**
     * BCrypt-hashed 4-digit transaction PIN.
     * Stored as nullable — user must explicitly set it in Security Settings.
     * Required for every money transfer.
     */
    @Column(name = "transaction_pin")
    private String transactionPin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private boolean firstLogin;

    @Column(nullable = false)
    private boolean forcePasswordReset;
}
