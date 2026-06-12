# F104 — Blocklist management

## Purpose
Prevent shortening or redirecting links involving banned domains.

## Summary
- Maintain a blocklist of domains and reasons.
- Deny link creation for blocked domains.
- Deny redirects if the target domain is blocked.
- Offer admin tools to add, edit, or remove entries.

## Acceptance criteria
- Blocked domains are blocked at creation and redirect time.
- Admins can manage blocklist entries.
- Blocked domain reasons are recorded.
