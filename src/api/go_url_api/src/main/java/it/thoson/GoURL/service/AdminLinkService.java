package it.thoson.GoURL.service;

import it.thoson.GoURL.domain.entity.Link;
import it.thoson.GoURL.domain.enums.LinkStatus;
import it.thoson.GoURL.dto.request.AdminUpdateLinkRequest;
import it.thoson.GoURL.dto.response.LinkResponse;
import it.thoson.GoURL.exception.LinkNotFoundException;
import it.thoson.GoURL.repository.LinkRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminLinkService {

    private final LinkRepository linkRepository;

    public AdminLinkService(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    @Transactional(readOnly = true)
    public Page<LinkResponse> searchLinks(String keyword, LinkStatus status, Pageable pageable, String baseUrl) {
        return linkRepository.searchLinks(keyword, status, pageable)
                .map(link -> LinkResponse.from(link, baseUrl));
    }

    @Transactional(readOnly = true)
    public LinkResponse getLinkById(Long id, String baseUrl) {
        Link link = linkRepository.findById(id)
                .orElseThrow(() -> new LinkNotFoundException(String.valueOf(id)));
        return LinkResponse.from(link, baseUrl);
    }

    @Transactional
    public LinkResponse updateLink(Long id, AdminUpdateLinkRequest request, String baseUrl) {
        Link link = linkRepository.findById(id)
                .orElseThrow(() -> new LinkNotFoundException(String.valueOf(id)));

        if (request.disabled() != null) {
            link.setStatus(request.disabled() ? LinkStatus.disabled : LinkStatus.active);
        }
        if (request.expiresAt() != null) {
            link.setExpiresAt(request.expiresAt());
        }

        return LinkResponse.from(linkRepository.save(link), baseUrl);
    }
}
