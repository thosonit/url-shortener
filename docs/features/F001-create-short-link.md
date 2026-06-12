# F001 — Create short link

## Purpose
Enable users to shorten a long URL into a shareable short code.

## Summary
- Accept a long URL from the user or client.
- Validate the URL and reject invalid or self-referential inputs.
- Create a new link record in the database.
- Generate or resolve the short code.
- Return the short URL and expiry metadata.

## Acceptance criteria
- Valid URLs produce a short code and short URL.
- Invalid URLs are rejected with a clear error.
- Self-referential URLs to the system domain are rejected.
- Short code generation uses the database record as the source of truth.

## Related API
- `POST /api/links`

## Notes
Short code generation can either store `code` after insert or compute `base62(id)` at read time.
