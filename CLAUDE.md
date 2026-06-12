# CLAUDE.md

## What this is

A URL shortener. Two core operations everything else builds on:

1. **Shorten** — accept a long URL, generate a short code, store the mapping.
2. **Redirect** — look up a short code, redirect to the original URL.

## State

Docs-only scaffold — no application code yet, no dependency manifest. The **chosen**
stack is Next.js full-stack · Prisma · PostgreSQL · Auth.js
(see [README](README.md#tech-stack)); it is decided but not yet scaffolded. Do not assume a
build/test/lint command exists; there are none yet. Add the real commands here once scaffolded.

## Docs

Decisions not derivable from code live in `docs/`:

- [`docs/features.md`](docs/features.md) — feature map (App `FAxxx` / CMS `FCxxx`, two-tier); detail per feature in [`docs/features/`](docs/features/).
- [`docs/api/`](docs/api/api.md) — REST API reference: [`api.md`](docs/api/api.md) index (conventions, auth, endpoint list) + [`openapi.yaml`](docs/api/openapi.yaml) (Swagger / OpenAPI 3.1 contract).
- [`docs/database.md`](docs/database.md) — data model (users, links).
- [`docs/technical.md`](docs/technical.md) — core flows (code-gen, anon claim, expiry, suspension, RBAC).
- [`docs/plans/implementation-plan.md`](docs/plans/implementation-plan.md) — phased build plan.

Read these before implementing.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Secrets in `.env*` (commit `.env.example` only); never commit real env files.
