# Feature Index

Two-tier feature map: each epic (`FAxxx` / `FCxxx`) is a deliverable unit; sub-features
carry their own IDs (e.g. `FA001.1`). Features are grouped by surface — **App / Web** and
**CMS** — with no phase labels.

## App / Web features

- [FA001 — Create short link](./features/FA001-create-short-link.md) — validation · code-gen · quick copy · QR code
- [FA002 — Redirect short code](./features/FA002-redirect-short-code.md) — click count · 410 expired · 404
- [FA003 — Google sign-in](./features/FA003-google-sign-in.md) — OAuth · anonymous link claim
- [FA004 — Link history](./features/FA004-link-history.md) — list own links (auth)
- [FA005 — Link expiration / TTL](./features/FA005-link-expiration-ttl.md) — anon 30d · user permanent · custom expiry date · enforcement
- [FA006 — Rate limiting](./features/FA006-rate-limiting.md) — per-IP creation cap

## CMS features

- [FC001 — Admin dashboard](./features/FC001-cms-dashboard.md) — KPIs
- [FC002 — RBAC / permissions](./features/FC002-admin-rbac.md) — presets · role assignment · admin session hardening
- [FC003 — Link management](./features/FC003-link-management.md) — search · disable/enable · force-expire · clicks
- [FC006 — User management](./features/FC006-user-management.md) — list · suspend · view links

## Out of scope

### App / Web

- **Custom alias / vanity URLs** — removed from the development scope.
- Password-protected links
- Bulk creation
- UTM builder
- API keys
- Editing the destination URL

### CMS

- **Reports & moderation** — public report flow + moderation queue; removed from scope.
- **Blocklist** — banned-domain CRUD + enforcement; removed from scope.
- Detailed analytics (geo / referrer / device)
