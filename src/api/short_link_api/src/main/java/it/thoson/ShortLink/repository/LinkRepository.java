package it.thoson.ShortLink.repository;

import it.thoson.ShortLink.domain.entity.Link;
import it.thoson.ShortLink.domain.enums.LinkStatus;
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

    // FA-REDIRECT: atomic click count increment
    @Modifying
    @Query("UPDATE Link l SET l.clickCount = l.clickCount + 1 WHERE l.id = :id")
    void incrementClickCount(@Param("id") Long id);

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
            Pageable pageable);

    // FA-EDIT / FA-DELETE: ownership check — returns empty if id exists but belongs to another user
    Optional<Link> findByIdAndUserId(Long id, String userId);

    // FC-USERS: admin — view all links belonging to a user
    List<Link> findByUserIdOrderByCreatedAtDesc(String userId);

    // FC-STATS: count links created on or after a given timestamp
    long countByCreatedAtAfter(LocalDateTime since);
}
