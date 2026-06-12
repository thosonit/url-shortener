# F007 — URL validation

## Purpose
Protect the system and users by validating incoming URL submissions.

## Summary
- Accept only `http` and `https` URLs.
- Reject malformed URLs without a hostname.
- Reject URLs that point back to the shortener domain.
- Return friendly validation error messages.

## Acceptance criteria
- Only valid `http`/`https` URLs are accepted.
- Self-referential URLs are rejected.
- Validation errors are clear and actionable.
