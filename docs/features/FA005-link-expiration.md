# F005 — Link expiration

## Purpose
Manage link expiration so anonymous links automatically expire after 30 days.

## Summary
- Set `expires_at` for anonymous links on creation.
- Keep authenticated links permanent by default.
- Check expiry during redirect resolution.
- Surface expiry status in history and link details.

## Acceptance criteria
- Anonymous links expire after 30 days.
- Expired links return `410 Gone`.
- Authenticated links remain active unless disabled later.

## Notes
Link expiry is enforced at redirect time and in any list views showing status.
