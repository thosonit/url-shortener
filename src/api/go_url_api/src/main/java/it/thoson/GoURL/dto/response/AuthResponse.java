package it.thoson.GoURL.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
