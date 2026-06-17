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

- [`docs/features.md`](docs/features.md) — feature map (App `FA-<NAME>` / CMS `FC-<NAME>`, two-tier); detail per feature in [`docs/features/`](docs/features/).
- [`docs/api/`](docs/api/api.md) — REST API reference: [`api.md`](docs/api/api.md) index (conventions, auth, endpoint list) + [`openapi.yaml`](docs/api/openapi.yaml) (Swagger / OpenAPI 3.1 contract).
- [`docs/database.md`](docs/database.md) — data model (users, links).
- [`docs/technical.md`](docs/technical.md) — core flows (code-gen, anon claim, expiry, suspension, RBAC).
- [`docs/plans/implementation-plan.md`](docs/plans/implementation-plan.md) — phased build plan.

Read these before implementing.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Secrets in `.env*` (commit `.env.example` only); never commit real env files.

## Agent Rules (MANDATORY)

These rules apply to all agents and must not be bypassed.

### Before writing any code

1. **Confirm approach first** — state the plan (files to touch, key decisions, tradeoffs) and wait for explicit user approval before writing a single line of implementation code.
2. **Brainstorm with SuperPower** — for any non-trivial task, use the SuperPower plugin to explore alternatives and surface blind spots before settling on an approach.

### Git operations

- **Never commit autonomously.** Only run `git commit` when the user explicitly asks (e.g. "commit", "commit this", "make a commit").
- **Never push autonomously.** Only run `git push` when the user explicitly asks (e.g. "push", "push this").
- Preparing a commit message draft is fine; executing the commit is not unless asked.
