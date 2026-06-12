# Feature Index

Two-tier feature map: each epic (`FA-<NAME>` App/Web · `FC-<NAME>` CMS, where `<NAME>` is a
short mnemonic for the function) is a deliverable unit; sub-features carry their own IDs
(e.g. `FA-SHORTEN.1`). Features are grouped by surface — **App / Web** and **CMS** — with no phase labels.

## App / Web features

- [FA-SHORTEN — Create short link](./features/FA-SHORTEN-create-short-link.md) — validation · code-gen · quick copy · QR code
- [FA-REDIRECT — Redirect short code](./features/FA-REDIRECT-redirect-short-code.md) — click count · 410 expired · 404
- [FA-SIGNIN — Google sign-in](./features/FA-SIGNIN-google-sign-in.md) — OAuth · anonymous link claim
- [FA-HISTORY — Link history](./features/FA-HISTORY-link-history.md) — list own links (auth)
- [FA-EXPIRY — Link expiration / TTL](./features/FA-EXPIRY-link-expiration-ttl.md) — anon 30d · user permanent · custom expiry date · enforcement

## CMS features

- [FC-DASH — Admin dashboard](./features/FC-DASH-cms-dashboard.md) — KPIs
- [FC-RBAC — RBAC / permissions](./features/FC-RBAC-admin-rbac.md) — presets · role assignment · admin session hardening
- [FC-LINKS — Link management](./features/FC-LINKS-link-management.md) — search · disable/enable · force-expire · clicks
- [FC-USERS — User management](./features/FC-USERS-user-management.md) — list · suspend · view links

## Out of scope

### App / Web

- **Custom alias / vanity URLs** — removed from the development scope.
- **Rate limiting** — per-IP creation cap; removed from scope.
- Password-protected links
- Bulk creation
- UTM builder
- API keys
- Editing the destination URL
- Deleting or editing your own links (user-initiated)

### CMS

- **Reports & moderation** — public report flow + moderation queue; removed from scope.
- **Blocklist** — banned-domain CRUD + enforcement; removed from scope.
- Detailed analytics (geo / referrer / device)
