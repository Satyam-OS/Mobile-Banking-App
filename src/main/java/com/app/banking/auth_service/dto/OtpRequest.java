package com.app.banking.auth_service.dto;

public class OtpRequest {

    private String phone;

    public OtpRequest() {
    }

    public OtpRequest(String phone) {
        this.phone = phone;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
