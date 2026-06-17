package it.thoson.GoURL.dto.response;

import it.thoson.GoURL.domain.entity.User;
import it.thoson.GoURL.domain.enums.UserRole;
import it.thoson.GoURL.domain.enums.UserStatus;
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
