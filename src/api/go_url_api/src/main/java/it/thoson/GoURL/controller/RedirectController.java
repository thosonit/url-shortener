package it.thoson.GoURL.controller;

import it.thoson.GoURL.service.LinkService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.io.IOException;

@Tag(name = "Redirection", description = "Endpoint for redirecting short URLs to their original URLs")
@RestController
public class RedirectController {

    private final LinkService linkService;

    public RedirectController(LinkService linkService) {
        this.linkService = linkService;
    }

    @Operation(summary = "Redirect to original URL", description = "Redirects a short URL to its original URL. Increments click count for analytics.")
    @GetMapping("/{code}")
    public void redirect(@PathVariable String code, HttpServletResponse response) throws IOException {
        String originalUrl = linkService.resolveOriginalUrl(code);
        linkService.incrementClick(code);
        response.sendRedirect(originalUrl);
    }
}
