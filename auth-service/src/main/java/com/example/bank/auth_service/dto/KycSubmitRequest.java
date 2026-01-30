package com.example.bank.auth_service.dto;

import lombok.Data;

@Data
public class KycSubmitRequest {

    private String mobile;
    private String fullName;
    private String email;
    private String dob;
    private String gender;

    private String addressLine1;
    private String city;
    private String state;
    private String pincode;

    private String panNumber;
    private String aadharNumber;
    private String accountType;

    private String panDocUrl;
    private String aadharFrontUrl;
    private String aadharBackUrl;
}
