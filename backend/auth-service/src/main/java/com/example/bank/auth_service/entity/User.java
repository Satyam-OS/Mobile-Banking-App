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

    //  FIX: Added name fields — previously missing, caused "Hello 7878787878" bug
    @Column
    private String firstName;

    @Column
    private String email;

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
