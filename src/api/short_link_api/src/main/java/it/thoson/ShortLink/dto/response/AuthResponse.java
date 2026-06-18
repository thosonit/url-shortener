package it.thoson.ShortLink.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
