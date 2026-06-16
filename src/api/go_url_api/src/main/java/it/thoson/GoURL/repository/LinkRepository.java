package it.thoson.GoURL.repository;

import it.thoson.GoURL.domain.entity.Link;
import it.thoson.GoURL.domain.enums.LinkStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LinkRepository extends JpaRepository<Link, Long> {

    // FA-REDIRECT: lookup by short code
    Optional<Link> findByCode(String code);

    // FA-HISTORY: list own links (authenticated user)
    Page<Link> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    // FA-HISTORY: list own links (anonymous session)
    Page<Link> findByAnonSessionIdOrderByCreatedAtDesc(String anonSessionId, Pageable pageable);

    // FA-REDIRECT: atomic click count increment
    @Modifying
    @Query("UPDATE Link l SET l.clickCount = l.clickCount + 1 WHERE l.id = :id")
    void incrementClickCount(@Param("id") Long id);

    // FA-EXPIRY: claim anonymous links on sign-in
    @Modifying
    @Query("UPDATE Link l SET l.userId = :userId, l.anonSessionId = NULL, l.expiresAt = NULL WHERE l.anonSessionId = :anonSessionId")
    void claimAnonLinks(@Param("anonSessionId") String anonSessionId, @Param("userId") String userId);

    // FA-EXPIRY: scheduler — mark expired links
    @Modifying
    @Query("UPDATE Link l SET l.status = 'EXPIRED' WHERE l.expiresAt < :now AND l.status = 'ACTIVE'")
    void expireLinks(@Param("now") LocalDateTime now);

    // FC-LINKS: admin search/filter with pagination
    @Query("""
        SELECT l FROM Link l
        WHERE (:keyword IS NULL OR l.originalUrl LIKE %:keyword% OR l.code LIKE %:keyword%)
        AND   (:status IS NULL OR l.status = :status)
        ORDER BY l.createdAt DESC
        """)
    Page<Link> searchLinks(
        @Param("keyword") String keyword,
        @Param("status") LinkStatus status,
        Pageable pageable
    );

    // FC-USERS: admin — view all links belonging to a user
    List<Link> findByUserIdOrderByCreatedAtDesc(String userId);
}
