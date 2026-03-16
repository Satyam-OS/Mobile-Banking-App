package com.example.bank.auth_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "BANKING_APP_SECRET_KEY_1234567890";

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }


    public String generateToken(String userId, String customerId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("customerId", customerId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000L)) // 24 hrs
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String generateKycToken(String mobile) {
        return Jwts.builder()
                .setSubject(mobile)
                .claim("role", "USER")
                .claim("kycOnly", true)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000L)) // 1 hr
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractSubject(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }
}
