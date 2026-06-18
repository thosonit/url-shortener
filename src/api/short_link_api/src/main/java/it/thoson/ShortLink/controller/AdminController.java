package it.thoson.ShortLink.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.thoson.ShortLink.config.SwaggerConfig;
import it.thoson.ShortLink.domain.enums.LinkStatus;
import it.thoson.ShortLink.dto.request.AdminAssignRoleRequest;
import it.thoson.ShortLink.dto.request.AdminUpdateLinkRequest;
import it.thoson.ShortLink.dto.request.AdminUpdateUserRequest;
import it.thoson.ShortLink.dto.response.ApiResponse;
import it.thoson.ShortLink.dto.response.LinkResponse;
import it.thoson.ShortLink.dto.response.StatsResponse;
import it.thoson.ShortLink.dto.response.UserResponse;
import it.thoson.ShortLink.service.AdminLinkService;
import it.thoson.ShortLink.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "Admin-only endpoints for managing links and users")
@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = SwaggerConfig.BEARER_SCHEME)
public class AdminController {

    private final AdminLinkService adminLinkService;
    private final AdminUserService adminUserService;

    public AdminController(AdminLinkService adminLinkService, AdminUserService adminUserService) {
        this.adminLinkService = adminLinkService;
        this.adminUserService = adminUserService;
    }

    // --- Stats ---

    @Operation(summary = "KPI snapshot", description = "Returns total links, links created today, and active user count.")
    @GetMapping("/stats")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<StatsResponse> getStats() {
        return ApiResponse.ok(adminUserService.getStats());
    }

    // --- Links ---

    @Operation(summary = "Search all links", description = "Paginated search across all links. Optional ?keyword and ?status filters.")
    @GetMapping("/links")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<LinkResponse>> searchLinks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LinkStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        Page<LinkResponse> result = adminLinkService.searchLinks(
                keyword, status, PageRequest.of(page, size), resolveBaseUrl(httpRequest));
        return ApiResponse.ok(result.getContent());
    }

    @Operation(summary = "Link detail", description = "Returns full detail for a single link by id.")
    @GetMapping("/links/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LinkResponse> getLinkById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        return ApiResponse.ok(adminLinkService.getLinkById(id, resolveBaseUrl(httpRequest)));
    }

    @Operation(summary = "Update link (admin)", description = "Disable / enable a link or force-set its expiry date.")
    @PatchMapping("/links/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LinkResponse> updateLink(
            @PathVariable Long id,
            @RequestBody AdminUpdateLinkRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponse.ok(adminLinkService.updateLink(id, request, resolveBaseUrl(httpRequest)));
    }

    // --- Users ---

    @Operation(summary = "List / search users", description = "Paginated list of non-anonymous users. Optional ?keyword filter on email.")
    @GetMapping("/users")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<UserResponse>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<UserResponse> result = adminUserService.searchUsers(keyword, PageRequest.of(page, size));
        return ApiResponse.ok(result.getContent());
    }

    @Operation(summary = "User detail", description = "Returns profile of a single user.")
    @GetMapping("/users/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<UserResponse> getUserById(@PathVariable String id) {
        return ApiResponse.ok(adminUserService.getUserById(id));
    }

    @Operation(summary = "Links owned by user", description = "Returns all links belonging to the given user.")
    @GetMapping("/users/{id}/links")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<LinkResponse>> getUserLinks(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        return ApiResponse.ok(adminUserService.getUserLinks(id, resolveBaseUrl(httpRequest)));
    }

    @Operation(summary = "Suspend / unsuspend user", description = "Set suspended=true to deactivate, false to reactivate.")
    @PatchMapping("/users/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<UserResponse> updateUserStatus(
            @PathVariable String id,
            @RequestBody AdminUpdateUserRequest request) {
        return ApiResponse.ok(adminUserService.updateUserStatus(id, request));
    }

    @Operation(summary = "Assign role (super_admin only)", description = "Changes the role of a user. Blocks self-demotion and removal of the last super_admin.")
    @PatchMapping("/users/{id}/role")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<UserResponse> assignRole(
            @PathVariable String id,
            @Valid @RequestBody AdminAssignRoleRequest request) {
        return ApiResponse.ok(adminUserService.assignRole(id, request, resolveCallerId()));
    }

    // --- Helpers ---

    private String resolveBaseUrl(HttpServletRequest request) {
        return request.getScheme() + "://" + request.getServerName()
                + (request.getServerPort() == 80 || request.getServerPort() == 443
                        ? ""
                        : ":" + request.getServerPort());
    }

    private String resolveCallerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UsernamePasswordAuthenticationToken && auth.getPrincipal() instanceof String userId) {
            return userId;
        }
        return null;
    }
}
