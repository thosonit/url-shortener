# F009 — Anonymous session + link claim

## Purpose
Ensure anonymous visitors can preserve links created before signing in.

## Summary
- Issue a signed `anon_session_id` cookie for anonymous users.
- Associate anonymous links with that session ID.
- On Google sign-in, assign those links to the authenticated user.
- Clear anonymous expiry and persist the links.

## Acceptance criteria
- Anonymous links created in-session can be claimed after sign-in.
- Claimed links move to the user account.
- Expiry is removed when a link is claimed.
