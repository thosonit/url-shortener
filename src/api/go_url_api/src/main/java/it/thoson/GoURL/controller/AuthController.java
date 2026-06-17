package it.thoson.GoURL.controller;

import it.thoson.GoURL.dto.response.AuthResponse;
import it.thoson.GoURL.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Authentication", description = "Endpoints for user authentication and token management")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Create anonymous session", description = "Creates a new anonymous session and returns access and refresh tokens. Useful for users who want to create links without registering.")
    @PostMapping("/anonymous")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse createAnonymousSession() {
        return authService.createAnonymousSession();
    }
}
