package it.thoson.ShortLink.service;

import it.thoson.ShortLink.domain.entity.User;
import it.thoson.ShortLink.domain.enums.UserRole;
import it.thoson.ShortLink.domain.enums.UserStatus;
import it.thoson.ShortLink.dto.request.AdminAssignRoleRequest;
import it.thoson.ShortLink.dto.request.AdminUpdateUserRequest;
import it.thoson.ShortLink.dto.response.LinkResponse;
import it.thoson.ShortLink.dto.response.StatsResponse;
import it.thoson.ShortLink.dto.response.UserResponse;
import it.thoson.ShortLink.exception.ForbiddenException;
import it.thoson.ShortLink.exception.UnauthorizedException;
import it.thoson.ShortLink.repository.LinkRepository;
import it.thoson.ShortLink.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final LinkRepository linkRepository;

    public AdminUserService(UserRepository userRepository, LinkRepository linkRepository) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        long totalLinks = linkRepository.count();
        long linksToday = linkRepository.countByCreatedAtAfter(LocalDateTime.now().toLocalDate().atStartOfDay());
        long activeUsers = userRepository.countActiveUsers(UserRole.anonymous);
        return new StatsResponse(totalLinks, linksToday, activeUsers);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsers(keyword, UserRole.anonymous, pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + id));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<LinkResponse> getUserLinks(String userId, String baseUrl) {
        return linkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(link -> LinkResponse.from(link, baseUrl))
                .toList();
    }

    @Transactional
    public UserResponse updateUserStatus(String id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + id));

        if (request.suspended() != null) {
            user.setStatus(request.suspended() ? UserStatus.inactive : UserStatus.active);
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse assignRole(String id, AdminAssignRoleRequest request, String callerUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + id));

        UserRole newRole = request.role();

        // Block assigning anonymous role
        if (newRole == UserRole.anonymous) {
            throw new ForbiddenException("Cannot assign anonymous role");
        }

        // Block self-demotion from super_admin
        if (id.equals(callerUserId) && user.getRole() == UserRole.super_admin && newRole != UserRole.super_admin) {
            throw new ForbiddenException("Cannot demote yourself from super_admin");
        }

        // Block removing last super_admin
        if (user.getRole() == UserRole.super_admin && newRole != UserRole.super_admin) {
            long superAdminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == UserRole.super_admin)
                    .count();
            if (superAdminCount <= 1) {
                throw new ForbiddenException("Cannot remove the last super_admin");
            }
        }

        user.setRole(newRole);
        return UserResponse.from(userRepository.save(user));
    }
}
