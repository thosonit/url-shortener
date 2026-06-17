package it.thoson.GoURL.dto.response;

public record StatsResponse(
        long totalLinks,
        long linksToday,
        long activeUsers) {}
