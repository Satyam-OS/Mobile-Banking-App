package com.example.bank.auth_service.security;

import com.example.bank.auth_service.entity.User;
import com.example.bank.auth_service.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        if (
                path.startsWith("/auth")
                        || path.startsWith("/otp")
                        || path.startsWith("/swagger-ui")
                        || path.startsWith("/v3/api-docs")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
            return;
        }

        try {
            String token = authHeader.substring(7);
            String subject = jwtUtil.extractCustomerId(token);
            String role = jwtUtil.extractRole(token);
            if ("USER".equals(role) && !path.startsWith("/kyc")) {
                userRepository.findByMobile(subject)
                        .filter(User::isActive)
                        .orElseThrow(() -> new RuntimeException("User inactive"));
            }

            List<GrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));


            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            subject,
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
