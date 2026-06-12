# F010 — Minimal rate limiting

## Purpose
Prevent abuse of anonymous link creation.

## Summary
- Apply a creation limit to `POST /api/links` for anonymous users.
- Use IP-based throttling or a sliding window.
- Reject excessive requests before creating links.

## Acceptance criteria
- Anonymous clients are blocked after repeated rapid requests.
- Legitimate usage is not interrupted.
- Rate limit responses are clear and actionable.
