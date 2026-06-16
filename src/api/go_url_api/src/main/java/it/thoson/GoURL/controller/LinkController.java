package it.thoson.GoURL.controller;

import it.thoson.GoURL.dto.request.CreateLinkRequest;
import it.thoson.GoURL.dto.request.UpdateLinkRequest;
import it.thoson.GoURL.dto.response.ApiResponse;
import it.thoson.GoURL.dto.response.LinkResponse;
import it.thoson.GoURL.service.LinkService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.ArrayList;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Link Management", description = "Endpoints for creating, updating, and deleting links")
@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    // POST /api/links
    @Operation(summary = "Create a new short link", description = "Creates a new short link for the given original URL. Supports both authenticated users and anonymous sessions.")
    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LinkResponse> createLink(
            @Valid @RequestBody CreateLinkRequest request,
            HttpServletRequest httpRequest) {

        String baseUrl = resolveBaseUrl(httpRequest);

        LinkResponse response = request.anonSessionId() != null
                ? linkService.createForAnon(request, baseUrl)
                : linkService.createForUser(request, resolveUserId(httpRequest), baseUrl);

        return ApiResponse.ok(response);
    }

    @GetMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArrayList<LinkResponse>> myLinks(HttpServletRequest httpRequest) {
        String baseUrl = resolveBaseUrl(httpRequest);
        Page<LinkResponse> linkPages = linkService.getUserLinks(resolveUserId(httpRequest), PageRequest.of(0, 10),
                resolveBaseUrl(httpRequest));
        return ApiResponse.ok(new ArrayList<>(linkPages.getContent()));
    }

    private String resolveBaseUrl(HttpServletRequest request) {
        return request.getScheme() + "://" + request.getServerName()
                + (request.getServerPort() == 80 || request.getServerPort() == 443
                        ? ""
                        : ":" + request.getServerPort());
    }

    private String resolveUserId(HttpServletRequest request) {
        return request.getHeader("X-User-Id");
    }
}
