# CLAUDE.md

## What this is

A URL shortener. Two core operations everything else builds on:

1. **Shorten** — accept a long URL, generate a short code, store the mapping.
2. **Redirect** — look up a short code, redirect to the original URL.

## State

Docs-only scaffold — no application code yet, no dependency manifest. The **recommended**
stack (start here) is Next.js full-stack · Prisma · PostgreSQL · Redis · Auth.js
(see [README](README.md#tech-stack-plan)); it is recommended, not yet scaffolded. All candidate
stacks share **PostgreSQL**. Do not assume a build/test/lint command exists; there are none yet.
Confirm the stack before scaffolding code, then add the real commands here.

## Docs

Decisions not derivable from code live in `docs/`:

- [`docs/features.md`](docs/features.md) — feature map (App `FAxxx` / CMS `FCxxx`, two-tier); detail per feature in [`docs/features/`](docs/features/).
- [`docs/api.md`](docs/api.md) — REST API reference (public + admin endpoints).
- [`docs/database.md`](docs/database.md) — data model (users, links, blocklist, reports, audit logs).
- [`docs/technical.md`](docs/technical.md) — core flows (code-gen, anon claim, expiry, rate limiting, RBAC).
- [`docs/plans/implementation-plan.md`](docs/plans/implementation-plan.md) — phased build plan.

Read these before implementing.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Secrets in `.env*` (commit `.env.example` only); never commit real env files.
