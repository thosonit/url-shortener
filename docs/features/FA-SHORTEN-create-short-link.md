# FA-SHORTEN — Create short link

## Purpose
Turn a long URL into a shareable short code, for anonymous and authenticated users alike.

## Summary
- Accept a long URL from the web form or API client.
- Validate the URL before persisting.
- Insert a new `links` record (source of truth for code generation).
- Generate the short code and return the short URL + expiry metadata.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA-SHORTEN.1 | URL validation | Accept `http`/`https` only; reject malformed URLs and self-referential links to the system's own domain. |
| FA-SHORTEN.2 | Short-code generation | Counter-based: `code = base62(links.id)`. The id is known only after insert (compute at read time, or `UPDATE code` right after insert). |
| FA-SHORTEN.3 | Quick copy | One-click copy button on the result. |
| FA-SHORTEN.4 | QR code | Render a QR code for the short URL on the result screen. Generated from `shortUrl` — no schema change. |

## Acceptance criteria
- Valid URLs return a `code`, `shortUrl`, and `expiresAt`.
- Invalid or self-referential URLs are rejected with a clear message (FA-SHORTEN.1).
- Code generation derives from the database record, never a client value (FA-SHORTEN.2).
- Result screen exposes a working copy control (FA-SHORTEN.3).
- Result screen shows a scannable QR code for the short URL (FA-SHORTEN.4).

## Related API
- `POST /api/links` `{ url, expiresAt? }` → `{ code, shortUrl, expiresAt }`
  - `expiresAt` is optional; when omitted, [[FA-EXPIRY]] applies the default TTL.

## Related
- [[FA-EXPIRY]] sets / validates `expires_at` at creation (incl. custom expiry).
