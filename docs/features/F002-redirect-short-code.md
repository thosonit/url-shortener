# F002 — Redirect short code

## Purpose
Resolve a short code and redirect the visitor to the original destination.

## Summary
- Accept a short code from the path.
- Look up the associated active link record.
- If expired, return `410 Gone` and show an expired page.
- If not found, return `404 Not Found`.
- If active, increment `click_count` and redirect to the original URL.

## Acceptance criteria
- Active codes redirect successfully.
- Expired codes return a friendly 410 page.
- Missing codes return a 404 response.
- `click_count` increments only on successful redirects.

## Related API
- `GET /:code`
