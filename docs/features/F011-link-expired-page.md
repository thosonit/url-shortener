# F011 — Link expired page

## Purpose
Show a useful expired message when a short link is no longer valid.

## Summary
- Return a 410 status for expired links.
- Display a friendly expired page instead of a blank error.
- Offer a path to create a new short link.

## Acceptance criteria
- Expired redirects return 410 and the expired page.
- The page explains why the link expired.
- Users are guided toward creating a fresh link.
