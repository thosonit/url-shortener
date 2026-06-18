package it.thoson.ShortLink.repository;

import it.thoson.ShortLink.domain.entity.User;
import it.thoson.ShortLink.domain.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, String> {

    User findByEmail(String email);

    boolean existsByEmail(String email);

    // FC-USERS: admin search by email keyword, excluding anonymous accounts
    @Query("""
            SELECT u FROM User u
            WHERE u.role != :anonymousRole
            AND (:keyword IS NULL OR u.email LIKE %:keyword%)
            ORDER BY u.createdAt DESC
            """)
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("anonymousRole") UserRole anonymousRole,
            Pageable pageable);

    // FC-STATS: count non-anonymous users active (not suspended)
    @Query("SELECT COUNT(u) FROM User u WHERE u.role != :anonymousRole AND u.status = it.thoson.ShortLink.domain.enums.UserStatus.active")
    long countActiveUsers(@Param("anonymousRole") UserRole anonymousRole);
}
