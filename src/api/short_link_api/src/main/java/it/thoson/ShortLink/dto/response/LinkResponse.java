package it.thoson.ShortLink.dto.response;

import it.thoson.ShortLink.domain.entity.Link;
import it.thoson.ShortLink.domain.enums.LinkStatus;
import java.time.LocalDateTime;

public record LinkResponse(
        Long id,
        String code,
        String shortUrl,
        String originalUrl,
        LinkStatus status,
        int clickCount,
        LocalDateTime expiresAt,
        LocalDateTime createdAt) {
    public static LinkResponse from(Link link, String baseUrl) {
        return new LinkResponse(
                link.getId(),
                link.getCode(),
                baseUrl + "/" + link.getCode(),
                link.getOriginalUrl(),
                link.getStatus(),
                link.getClickCount(),
                link.getExpiresAt(),
                link.getCreatedAt());
    }
}
