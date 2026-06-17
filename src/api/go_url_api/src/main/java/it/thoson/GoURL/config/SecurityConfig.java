package it.thoson.GoURL.config;

import it.thoson.GoURL.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // public
                        .requestMatchers(HttpMethod.GET, "/{code}").permitAll()
                        // auth endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/anonymous").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/google").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/google/callback").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                        // swagger
                        .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                        // links — anon + user
                        .requestMatchers(HttpMethod.POST, "/api/links").hasAnyRole("anonymous", "user")
                        .requestMatchers(HttpMethod.GET, "/api/links").hasRole("user")
                        .requestMatchers("/api/links/**").hasRole("user")
                        // admin — role assignment is super_admin only; other admin routes accept both
                        .requestMatchers(HttpMethod.PATCH, "/api/admin/users/*/role").hasRole("super_admin")
                        .requestMatchers("/api/admin/**").hasAnyRole("admin", "super_admin")
                        // everything else requires auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
