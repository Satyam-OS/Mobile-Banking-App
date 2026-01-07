package com.app.banking.auth_service.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {}
