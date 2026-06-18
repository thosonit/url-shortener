package it.thoson.ShortLink.dto.response;

public record StatsResponse(
        long totalLinks,
        long linksToday,
        long activeUsers) {}
