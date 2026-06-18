package it.thoson.ShortLink.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateLinkRequest(
        @NotBlank(message = "URL is required") @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://") @Size(max = 2048, message = "URL must not exceed 2048 characters") String url,
        LocalDateTime expiresAt) {
}
