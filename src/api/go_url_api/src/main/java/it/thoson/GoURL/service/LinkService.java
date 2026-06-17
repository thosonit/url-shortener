package it.thoson.GoURL.service;

import it.thoson.GoURL.domain.entity.Link;
import it.thoson.GoURL.domain.enums.LinkStatus;
import it.thoson.GoURL.dto.request.CreateLinkRequest;
import it.thoson.GoURL.dto.request.UpdateLinkRequest;
import it.thoson.GoURL.dto.response.LinkResponse;
import it.thoson.GoURL.exception.LinkNotFoundException;
import it.thoson.GoURL.repository.LinkRepository;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class LinkService {

    private final LinkRepository linkRepository;
    private final CodeGeneratorService codeGenerator;

    public LinkService(LinkRepository linkRepository, CodeGeneratorService codeGenerator) {
        this.linkRepository = linkRepository;
        this.codeGenerator = codeGenerator;
    }

    @Transactional
    public LinkResponse createForUser(CreateLinkRequest request, String userId, String baseUrl) {
        log.info("Creating link for user {} with URL {}", userId, request.url());
        Link link = Link.forUser(request.url(), userId);
        link.setCode(codeGenerator.generate(request.url()));
        if (request.expiresAt() != null) {
            link.setExpiresAt(request.expiresAt());
        }
        return LinkResponse.from(linkRepository.save(link), baseUrl);
    }

    @Transactional(readOnly = true)
    public String resolveOriginalUrl(String code) {
        Link link = linkRepository.findByCode(code)
                .orElseThrow(() -> new LinkNotFoundException(code));

        if (link.getStatus() == LinkStatus.disabled) {
            throw new it.thoson.GoURL.exception.LinkDisabledException(code);
        }

        log.info("Resolving original URL for code {}", code);
        return link.getOriginalUrl();
    }

    @Transactional
    public void incrementClick(String code) {
        log.info("Incrementing click count for code {}", code);
        Link link = linkRepository.findByCode(code)
                .orElseThrow(() -> new LinkNotFoundException(code));
        linkRepository.incrementClickCount(link.getId());
    }

    @Transactional(readOnly = true)
    public Page<LinkResponse> getUserLinks(String userId, Pageable pageable, String baseUrl) {
        return linkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(link -> LinkResponse.from(link, baseUrl));
    }

    @Transactional(readOnly = true)
    public Page<LinkResponse> getAnonLinks(String anonSessionId, Pageable pageable, String baseUrl) {
        return linkRepository.findByAnonSessionIdOrderByCreatedAtDesc(anonSessionId, pageable)
                .map(link -> LinkResponse.from(link, baseUrl));
    }

    @Transactional
    public LinkResponse updateLink(Long id, UpdateLinkRequest request, String baseUrl) {
        Link link = linkRepository.findById(id)
                .orElseThrow(() -> new LinkNotFoundException(String.valueOf(id)));

        if (request.url() != null) {
            link.setOriginalUrl(request.url());
        }
        if (request.disabled() != null) {
            link.setStatus(request.disabled() ? LinkStatus.disabled : LinkStatus.active);
        }
        if (request.expiresAt() != null) {
            link.setExpiresAt(request.expiresAt());
        }

        return LinkResponse.from(linkRepository.save(link), baseUrl);
    }

    @Transactional
    public void deleteLink(Long id) {
        if (!linkRepository.existsById(id)) {
            throw new LinkNotFoundException(String.valueOf(id));
        }
        linkRepository.deleteById(id);
    }

    @Transactional
    public void claimAnonLinks(String anonSessionId, String userId) {
        linkRepository.claimAnonLinks(anonSessionId, userId);
    }
}
