# url-shortener

A service for turning long URLs into short, shareable links and redirecting visitors back to the original destination.

> **Status:** early scaffold. The tech stack has not been chosen yet — see [Decisions](#decisions).

## Overview

The core idea is small:

1. **Shorten** — accept a long URL, generate a unique short code, store the mapping.
2. **Redirect** — look up a short code and issue an HTTP redirect to the original URL.

Everything else (custom aliases, analytics, expiry, auth, rate limiting) builds on top of those two operations.

The system will support:

- A public web/app user interface for creating short links and following redirects.
- A REST API for programmatic link creation and redirect lookups.
- A CMS dashboard for managing links, analytics, and content.

User-facing functionality:

- Web/App: Create and manage short links, follow redirects, view personal link history, and optionally sign in with Google for saved link management.
- CMS: Admins can manage all links, approve or revoke custom aliases, configure expiration rules, review click analytics, and monitor abuse or rate limit activity.

## Planned Features
- [ ] Create a short link from a long URL
- [ ] Redirect short code to original URL
- [ ] Google sign-in for saved link management
- [ ] Custom aliases / vanity URLs
- [ ] Link expiration
- [ ] Click analytics

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
