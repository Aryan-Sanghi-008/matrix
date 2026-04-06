package com.ertriage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/qr/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                // Recycle Bin — ADMIN, DOCTOR, SUPERVISOR
                .requestMatchers("/api/patients/recycle-bin/**").hasAnyRole("ADMIN", "DOCTOR", "SUPERVISOR")
                // User management write operations — ADMIN only
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/users").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                // User listing by role — any authenticated user (for task assignment dropdowns)
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/role/**").authenticated()
                // User listing — ADMIN and SUPERVISOR only
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users").hasAnyRole("ADMIN", "SUPERVISOR")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/*").hasAnyRole("ADMIN", "SUPERVISOR")
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(fo -> fo.disable()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
