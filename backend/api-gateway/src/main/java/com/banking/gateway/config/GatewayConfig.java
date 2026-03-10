//package com.banking.gateway.config;
//
//import com.banking.gateway.filter.JwtAuthenticationFilter;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.cloud.gateway.route.RouteLocator;
//import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class GatewayConfig {
//
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    @Value("${AUTH_SERVICE_URL:http://localhost:8081}")
//    private String authServiceUrl;
//
//    @Value("${ACCOUNT_SERVICE_URL:http://localhost:8082}")
//    private String accountServiceUrl;
//
//    @Value("${TRANSACTION_SERVICE_URL:http://localhost:8083}")
//    private String transactionServiceUrl;
//
//    public GatewayConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
//        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
//    }
//
//    @Bean
//    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
//        System.out.println("ROUTES LOADED");
//
//        return builder.routes()
//
//                .route("auth-service", r -> r
//                        .path("/auth/**")
//                        
//                        .uri(authServiceUrl))
//
//                .route("account-service", r -> r
//                        .path("/account/**")
//                        
//                        .uri(accountServiceUrl))
//
//                .route("transaction-service", r -> r
//                        .path("/transaction/**")
//                        
//                        .uri(transactionServiceUrl))
//
//
//                .route("auth-swagger", r -> r
//                        .path("/auth/v3/api-docs", "/auth/swagger-ui/**")
//                        .uri(authServiceUrl))
//
//                .route("account-swagger", r -> r
//                        .path("/account/v3/api-docs", "/account/swagger-ui/**")
//                        .uri(accountServiceUrl))
//
//                .route("transaction-swagger", r -> r
//                        .path("/transaction/v3/api-docs", "/transaction/swagger-ui/**")
//                        .uri(transactionServiceUrl))
//
//                .build();
//    }
//}
