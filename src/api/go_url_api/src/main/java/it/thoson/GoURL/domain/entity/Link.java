package it.thoson.GoURL.domain.entity;

import it.thoson.GoURL.domain.enums.LinkStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "links")
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "original_url", nullable = false, length = 2048)
    private String originalUrl;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "anon_session_id")
    private String anonSessionId;

    @Column(name = "click_count", nullable = false)
    private int clickCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LinkStatus status = LinkStatus.ACTIVE;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static Link forUser(String originalUrl, String userId) {
        Link link = new Link();
        link.originalUrl = originalUrl;
        link.userId = userId;
        link.expiresAt = null; // permanent
        return link;
    }

    public static Link forAnon(String originalUrl, String anonSessionId) {
        Link link = new Link();
        link.originalUrl = originalUrl;
        link.anonSessionId = anonSessionId;
        link.expiresAt = LocalDateTime.now().plusDays(30);
        return link;
    }

    @PrePersist
    private void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getOriginalUrl() { return originalUrl; }
    public void setOriginalUrl(String originalUrl) { this.originalUrl = originalUrl; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getAnonSessionId() { return anonSessionId; }
    public void setAnonSessionId(String anonSessionId) { this.anonSessionId = anonSessionId; }
    public int getClickCount() { return clickCount; }
    public void setClickCount(int clickCount) { this.clickCount = clickCount; }
    public LinkStatus getStatus() { return status; }
    public void setStatus(LinkStatus status) { this.status = status; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
