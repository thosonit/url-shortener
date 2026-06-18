package it.thoson.ShortLink.controller;

import it.thoson.ShortLink.dto.request.CreateLinkRequest;
import it.thoson.ShortLink.dto.request.UpdateLinkRequest;
import it.thoson.ShortLink.dto.response.ApiResponse;
import it.thoson.ShortLink.dto.response.LinkResponse;
import it.thoson.ShortLink.service.LinkService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.ArrayList;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.thoson.ShortLink.config.SwaggerConfig;

@Tag(name = "Link Management", description = "Endpoints for creating, updating, and deleting links")
@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    // POST /api/links
    @Operation(
        summary = "Create a new short link",
        description = "Creates a new short link. Accepts an access token (anonymous or user) in `Authorization: Bearer <token>`. If no token is provided the link is created without an owner.",
        security = @SecurityRequirement(name = SwaggerConfig.BEARER_SCHEME)
    )
    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LinkResponse> createLink(
            @Valid @RequestBody CreateLinkRequest request,
            HttpServletRequest httpRequest) {

        String baseUrl = resolveBaseUrl(httpRequest);

        LinkResponse response = linkService.createForUser(request, resolveUserId(), baseUrl);

        return ApiResponse.ok(response);
    }

    @Operation(
        summary = "List my links",
        description = "Returns paginated links owned by the authenticated user. Requires a user access token in `Authorization: Bearer <token>`.",
        security = @SecurityRequirement(name = SwaggerConfig.BEARER_SCHEME)
    )
    @GetMapping()
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ArrayList<LinkResponse>> myLinks(HttpServletRequest httpRequest) {
        String baseUrl = resolveBaseUrl(httpRequest);
        Page<LinkResponse> linkPages = linkService.getUserLinks(resolveUserId(), PageRequest.of(0, 10), baseUrl);
        return ApiResponse.ok(new ArrayList<>(linkPages.getContent()));
    }

    @Operation(
        summary = "Update a link",
        description = "Edit the destination URL or toggle active/disabled status. Caller must own the link.",
        security = @SecurityRequirement(name = SwaggerConfig.BEARER_SCHEME)
    )
    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LinkResponse> updateLink(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLinkRequest request,
            HttpServletRequest httpRequest) {

        String baseUrl = resolveBaseUrl(httpRequest);
        LinkResponse response = linkService.updateLink(id, resolveUserId(), request, baseUrl);
        return ApiResponse.ok(response);
    }

    @Operation(
        summary = "Delete a link",
        description = "Permanently deletes the link. Caller must own the link.",
        security = @SecurityRequirement(name = SwaggerConfig.BEARER_SCHEME)
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(@PathVariable Long id) {
        linkService.deleteLink(id, resolveUserId());
    }

    private String resolveBaseUrl(HttpServletRequest request) {
        return request.getScheme() + "://" + request.getServerName()
                + (request.getServerPort() == 80 || request.getServerPort() == 443
                        ? ""
                        : ":" + request.getServerPort());
    }

    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UsernamePasswordAuthenticationToken && auth.getPrincipal() instanceof String userId) {
            return userId;
        }
        return null;
    }
}
