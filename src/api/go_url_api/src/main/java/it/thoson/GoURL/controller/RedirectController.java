package it.thoson.GoURL.controller;

import it.thoson.GoURL.service.LinkService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class RedirectController {

    private final LinkService linkService;

    public RedirectController(LinkService linkService) {
        this.linkService = linkService;
    }

    // GET /{code} — redirect tới URL gốc
    @GetMapping("/{code}")
    public void redirect(@PathVariable String code, HttpServletResponse response) throws IOException {
        String originalUrl = linkService.resolveOriginalUrl(code);
        linkService.incrementClick(code);
        response.sendRedirect(originalUrl);
    }
}
