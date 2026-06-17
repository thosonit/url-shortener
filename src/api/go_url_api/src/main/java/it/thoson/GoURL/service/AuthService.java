package it.thoson.GoURL.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import it.thoson.GoURL.domain.entity.User;
import it.thoson.GoURL.dto.response.AuthResponse;
import it.thoson.GoURL.exception.UnauthorizedException;
import it.thoson.GoURL.repository.UserRepository;
import it.thoson.GoURL.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final long accessTokenExpiration;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public AuthResponse createAnonymousSession() {
        User user = User.anonymous();
        userRepository.save(user);
        return issueTokens(user);
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        Claims claims;
        try {
            claims = jwtService.validateToken(refreshToken);
        } catch (JwtException e) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (!jwtService.isRefreshToken(claims)) {
            throw new UnauthorizedException("Token is not a refresh token");
        }

        String userId = jwtService.extractUserId(claims);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getRole());
        return new AuthResponse(accessToken, refreshToken, accessTokenExpiration / 1000);
    }
}
