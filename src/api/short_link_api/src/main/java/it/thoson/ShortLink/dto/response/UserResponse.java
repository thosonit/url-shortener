package it.thoson.ShortLink.dto.response;

import it.thoson.ShortLink.domain.entity.User;
import it.thoson.ShortLink.domain.enums.UserRole;
import it.thoson.ShortLink.domain.enums.UserStatus;
import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String email,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt());
    }
}
