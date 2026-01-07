package com.app.banking.auth_service.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class UserStatusAuthorization {

    public boolean isActiveCustomer(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomerUserDetails userDetails) {
            return userDetails
                    .isEnabled(); // ACTIVE only
        }

        return false;
    }
}
