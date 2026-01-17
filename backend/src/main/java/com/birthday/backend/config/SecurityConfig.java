package com.birthday.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // disable csrf for rest api (enable if using session-based auth later)
                .csrf(csrf -> csrf.disable())

                // configure authorization - allow all for now (add auth later)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll() // health checks
                        .anyRequest().permitAll() // allow all other requests for now
                )

                // configure security headers
                .headers(headers -> headers
                        // prevent clickjacking
                        .frameOptions(frame -> frame.deny())
                        // prevent mime-type sniffing
                        .contentTypeOptions(contentType -> {
                        })
                        // xss protection
                        .xssProtection(xss -> xss
                                .headerValue(
                                        org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        // referrer policy
                        .referrerPolicy(referrer -> referrer
                                .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // permissions policy (formerly feature policy)
                        .permissionsPolicy(permissions -> permissions
                                .policy("geolocation=(), microphone=(), camera=()")));

        return http.build();
    }
}
