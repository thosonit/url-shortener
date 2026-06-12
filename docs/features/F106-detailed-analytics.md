# F106 — Detailed analytics

## Purpose
Collect richer click data for analytics and future abuse detection.

## Summary
- Capture geo, referrer, and device metadata for clicks.
- Store analytics data in a dedicated model or event store.
- Surface analytics in CMS reports.

## Acceptance criteria
- Click metadata is recorded alongside redirects.
- Reports can show geo, referrer, and device distributions.
- Analytics storage does not impede redirect performance.
