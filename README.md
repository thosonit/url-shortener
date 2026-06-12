# url-shortener

A service for turning long URLs into short, shareable links and redirecting visitors back to the original destination.

> **Status:** early scaffold. The tech stack has not been chosen yet — see [Decisions](#decisions).

## Overview

The core idea is small:

1. **Shorten** — accept a long URL, generate a unique short code, store the mapping.
2. **Redirect** — look up a short code and issue an HTTP redirect to the original URL.

Everything else (QR codes, expiry, auth, rate limiting, moderation) builds on top of those two operations.

The system will support:

- A public web/app user interface for creating short links and following redirects.
- A REST API for programmatic link creation and redirect lookups.
- A CMS dashboard for managing links, users, reports, and abuse.

User-facing functionality:

- Web/App: Create short links (with QR codes and a copy action), follow redirects, view personal link history, set link expiration, and optionally sign in with Google to save and claim links.
- CMS: Admins manage all links (search, disable/enable, force-expire), handle reports and moderation, maintain a domain blocklist, manage users, and review an audit log — all governed by role-based access control.

## Planned Features

See [`docs/features.md`](docs/features.md) for the full two-tier feature map (`FAxxx` App/Web · `FCxxx` CMS).

### App / Web

- [ ] **FA001** — Create short link (validation · code-gen · quick copy · QR code)
- [ ] **FA002** — Redirect short code (click count · 410 expired · 404)
- [ ] **FA003** — Google sign-in (OAuth · anonymous link claim)
- [ ] **FA004** — Link history (list own links)
- [ ] **FA005** — Link expiration / TTL (anon 30d · user permanent · custom expiry date)
- [ ] **FA006** — Rate limiting (per-IP creation cap)

### CMS

- [ ] **FC001** — Admin dashboard (KPIs · growth charts)
- [ ] **FC002** — RBAC / permissions (presets · role assignment · 2FA)
- [ ] **FC003** — Link management (search · disable/enable · force-expire · clicks)
- [ ] **FC004** — Reports & moderation (report flow · resolve)
- [ ] **FC005** — Blocklist (domain CRUD · enforcement)
- [ ] **FC006** — User management (list · suspend · view links)
- [ ] **FC007** — Audit log (record mutations · read-only view)

### Out of scope

Custom alias / vanity URLs, password-protected links, bulk creation, UTM builder, API keys, editing the destination URL, and detailed analytics (geo / referrer / device).

## Tech stack plan

Example technology stacks that work well together:

- [ ] Minimal MVP stack
  - Web: Next.js
  - API: Fastify
  - CMS: Custom admin panel
  - Storage: PostgreSQL
- [ ] Full JavaScript stack
  - Web: Next.js
  - App: React Native / Expo
  - API: NestJS
  - CMS: Strapi
  - Storage: PostgreSQL
- [ ] Opinionated server-driven stack
  - Web: Remix
  - App: Ionic / Capacitor
  - API: Node + Express
  - CMS: Keystone
  - Storage: PostgreSQL
- [ ] Modern frontend + backend
  - Web: SvelteKit
  - App: Flutter
  - API: Fastify
  - CMS: Sanity
  - Storage: Redis + PostgreSQL
- [ ] Analytics-first stack
  - Web: SvelteKit
  - App: React Native / Expo
  - API: NestJS
  - CMS: Sanity
  - Storage: Redis + PostgreSQL

## License

Not yet specified.
