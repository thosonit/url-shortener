package it.thoson.GoURL.service;

import it.thoson.GoURL.domain.entity.Link;
import it.thoson.GoURL.domain.enums.LinkStatus;
import it.thoson.GoURL.dto.request.CreateLinkRequest;
import it.thoson.GoURL.dto.request.UpdateLinkRequest;
import it.thoson.GoURL.dto.response.LinkResponse;
import it.thoson.GoURL.exception.LinkNotFoundException;
import it.thoson.GoURL.repository.LinkRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Link link = Link.forUser(request.url(), userId);
        link.setCode(codeGenerator.generate(request.url()));
        if (request.expiresAt() != null) {
            link.setExpiresAt(request.expiresAt());
        }
        return LinkResponse.from(linkRepository.save(link), baseUrl);
    }

    @Transactional
    public LinkResponse createForAnon(CreateLinkRequest request, String baseUrl) {
        String anonSessionId = request.anonSessionId();
        Link link = Link.forAnon(request.url(), anonSessionId);
        link.setCode(codeGenerator.generate(request.url()));
        return LinkResponse.from(linkRepository.save(link), baseUrl);
    }

    @Transactional(readOnly = true)
    public String resolveOriginalUrl(String code) {
        Link link = linkRepository.findByCode(code)
                .orElseThrow(() -> new LinkNotFoundException(code));

        if (link.getStatus() == LinkStatus.EXPIRED) {
            throw new it.thoson.GoURL.exception.LinkDisabledException(code);
        }
        if (link.getStatus() == LinkStatus.EXPIRED) {
            throw new it.thoson.GoURL.exception.LinkExpiredException(code);
        }

        return link.getOriginalUrl();
    }

    @Transactional
    public void incrementClick(String code) {
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
            link.setStatus(request.disabled() ? LinkStatus.INACTIVE : LinkStatus.ACTIVE);
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
