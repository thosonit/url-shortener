# url-shortener

A service for turning long URLs into short, shareable links and redirecting visitors back to the original destination.

> **Status:** docs-only scaffold — no application code yet. The stack is chosen — see [Tech stack](#tech-stack).

## Overview

The core idea is small:

1. **Shorten** — accept a long URL, generate a unique short code, store the mapping.
2. **Redirect** — look up a short code and issue an HTTP redirect to the original URL.

Everything else (QR codes, expiry, auth) builds on top of those two operations.

The system will support:

- A public web/app user interface for creating short links and following redirects.
- A REST API for programmatic link creation and redirect lookups.
- A CMS dashboard for managing links and users.

User-facing functionality:

- Web/App: Create short links (with QR codes and a copy action), follow redirects, view personal link history, set link expiration, and optionally sign in with Google to save and claim links.
- CMS: Admins manage all links (search, disable/enable, force-expire) and manage users — all governed by role-based access control.

## Planned Features

See [`docs/features.md`](docs/features.md) for the full two-tier feature map (`FAxxx` App/Web · `FCxxx` CMS).

### App / Web

- [ ] **FA001** — Create short link (validation · code-gen · quick copy · QR code)
- [ ] **FA002** — Redirect short code (click count · 410 expired · 404)
- [ ] **FA003** — Google sign-in (OAuth · anonymous link claim)
- [ ] **FA004** — Link history (list own links)
- [ ] **FA005** — Link expiration / TTL (anon 30d · user permanent · custom expiry date)

### CMS

- [ ] **FC001** — Admin dashboard (KPIs)
- [ ] **FC002** — RBAC / permissions (presets · role assignment · admin session hardening)
- [ ] **FC003** — Link management (search · disable/enable · force-expire · clicks)
- [ ] **FC006** — User management (list · suspend · view links)

### Out of scope

Custom alias / vanity URLs, rate limiting, password-protected links, bulk creation, UTM builder, API keys, editing or deleting your own links, reports & moderation, domain blocklist, audit log, and detailed analytics (geo / referrer / device).

## Tech stack

The chosen stack. `database.md`, `api.md`, and the [implementation plan](docs/plans/implementation-plan.md) build on it.

| Layer | Choice |
|-------|--------|
| Web + CMS | Next.js (App Router, React, TypeScript) |
| API | Next.js Route Handlers |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Auth.js (NextAuth) |
| App (later) | React Native / Expo |

### Alternatives considered

Recorded for context; not the chosen path.

- **Dedicated API service** — Web: Next.js · API: NestJS or Fastify · ORM: Prisma · Storage: Redis + PostgreSQL
- **Server-driven** — Web: Remix · API: Node + Express · CMS: Keystone · Storage: PostgreSQL
- **Svelte ecosystem** — Web: SvelteKit · App: Flutter · API: Fastify · Storage: Redis + PostgreSQL

## License

Not yet specified.
