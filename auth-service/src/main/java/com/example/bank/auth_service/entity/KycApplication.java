package com.example.bank.auth_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kyc_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String mobile;

    // PERSONAL
    private String fullName;
    private String email;
    private LocalDate dob;
    private String gender;

    // ADDRESS
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;

    // DOCUMENTS
    private String panNumber;
    private String aadharNumber;
    private String panDocPath;
    private String aadharFrontPath;
    private String aadharBackPath;

    // ACCOUNT
    private String accountType;

    //STATUS
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus status;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
