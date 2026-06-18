package it.thoson.ShortLink.dto.request;

import it.thoson.ShortLink.domain.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record AdminAssignRoleRequest(@NotNull UserRole role) {}
