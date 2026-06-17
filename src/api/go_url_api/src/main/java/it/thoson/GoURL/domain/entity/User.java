package it.thoson.GoURL.domain.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import it.thoson.GoURL.domain.enums.UserRole;
import it.thoson.GoURL.domain.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    @Column(nullable = true, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = true, length = 512)
    private String passwordHash;

    @Column(name = "role", nullable = true)
    private UserRole role;

    @Column(name = "status", nullable = true)
    private UserStatus status;

    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt;

    private User() {
    }

    public static User anonymous() {
        User user = new User();
        user.id = UUID.randomUUID().toString();
        user.email = null;
        user.passwordHash = null;
        user.role = UserRole.anonymous;
        user.status = UserStatus.active;
        user.createdAt = LocalDateTime.now();
        return user;
    }

    @PrePersist
    private void prePersist() {
        if (id == null)
            id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
