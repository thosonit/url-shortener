package it.thoson.ShortLink.dto.request;

import java.time.LocalDateTime;

public record AdminUpdateLinkRequest(
        Boolean disabled,
        LocalDateTime expiresAt) {}
