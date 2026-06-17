package it.thoson.GoURL.dto.request;

import it.thoson.GoURL.domain.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record AdminAssignRoleRequest(@NotNull UserRole role) {}
