package com.app.banking.auth_service.security;

import com.app.banking.auth_service.entity.User;
import com.app.banking.auth_service.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String subject) {

        User user = userRepository
                .findByCustomerId(subject)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new CustomerUserDetails(user);
    }
}
