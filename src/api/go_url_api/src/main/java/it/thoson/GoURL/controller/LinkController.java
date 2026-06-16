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
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    // POST /api/links
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

    @GetMapping("/{code}")
    public ApiResponse<String> resolveLink(@PathVariable String code) {
        String originalUrl = linkService.resolveOriginalUrl(code);
        return ApiResponse.ok(originalUrl);
    }

    @GetMapping("/me/links")
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
