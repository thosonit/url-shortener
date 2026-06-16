package it.thoson.GoURL.domain.entity;

import java.time.LocalDateTime;
import it.thoson.GoURL.domain.enums.UserRole;
import it.thoson.GoURL.domain.enums.UserStatus;

public class User {
    String id;
    String email;
    UserRole role;
    UserStatus status;
    LocalDateTime createdAt;
}
