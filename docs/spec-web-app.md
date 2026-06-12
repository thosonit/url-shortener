# Spec — Web/App (User-facing)

> MVP scope for the Web/App + REST API surface, finalized through brainstorming.
> Goal: prove the core value loop — *create link → redirect correctly → measure clicks*.
> Everything more advanced is deferred to Phase 2.

## Foundational Decisions

- **Auth: hybrid** — supports both anonymous and authenticated usage.
  - Anonymous: can create links immediately, **no** personal history is persisted, links **auto-expire after 30 days**.
  - Authenticated (Google): links are tied to the user, **persisted permanently**, and visible in history.
- **Short code: counter + base62** — use `links.id` (auto-increment) as the counter, `code = base62(id)`.
- **Tech stack: undecided** (see README → Decisions). The data model below is stack-agnostic.

## MVP Features

| # | Feature | Details |
|---|---------|---------|
| 1 | Create short link | anonymous or authenticated |
| 2 | Redirect `GET /:code` | increment `click_count`; expired → **410 Gone + "Link expired" page** |
| 3 | URL validation | http/https scheme only, reject self-referential links to the system's own domain |
| 4 | Short-code generation | counter (`links.id`) → base62 |
| 5 | Google sign-in | minimal, only to associate links + enable history |
| 6 | Link history | for authenticated users |
| 7 | Anonymous TTL | `expires_at = created_at + 30 days`; user-owned links → `NULL` (permanent) |
| 8 | Click count | single counter per link |
| 9 | Quick copy | copy button on the result |
| 10 | Link claim on sign-in | track anonymous links by session → on sign-in: assign `user_id`, clear `expires_at` |
| 11 | Minimal rate limiting | cap links per IP per minute to curb anonymous-creation spam |
| 12 | "Link expired" page | serves feature #2 (410) |

## Data Model (stack-agnostic)

```
users(
  id, google_sub UNIQUE, email, display_name, created_at
)

links(
  id              BIGINT PK auto-increment   -- counter for code generation
  code            base62(id), UNIQUE, indexed
  original_url
  user_id         FK → users, NULLABLE       -- NULL = anonymous
  anon_session_id NULLABLE                    -- for claim on sign-in
  expires_at      NULLABLE                    -- now+30d (anonymous) / NULL (user-owned)
  click_count     INT default 0
  created_at
)
```

### Link-claim mechanism (#10)

Each visitor is issued an `anon_session_id` (signed cookie). Anonymous links store this id.
When the user signs in for the first time within that session:

```sql
UPDATE links
SET user_id = :userId, expires_at = NULL
WHERE anon_session_id = :anonId AND user_id IS NULL;
```

### Technical note on code = base62(id)

The `id` is only known after insert, so `code` can only be computed afterward. Two approaches (to finalize at implementation time):
- (a) insert, then `UPDATE code` immediately after, or
- (b) compute the code on the fly at read time and don't store a `code` column.

## Minimal API

- `POST /api/links` `{ url }` → `{ code, shortUrl, expiresAt }` — *rate-limited*
- `GET /:code` → 301 redirect / **410** if expired / 404 if not found
- `GET /api/me/links` → history (auth required)
- `POST /api/auth/google` + callback → establish session, trigger claim

## See also

- [Feature index](./features.md)
- [App/Web screens](./screens-app-web.md)
- [API reference](./api.md)
- [Database model](./database.md)
- [Technical details](./technical.md)

## Minimal Web (3 screens)

1. Create-link page (form + copy button + sign-in button)
2. History page (post sign-in)
3. "Link expired" page (410)

## Definition of Done

- Paste URL → short link in < 1s
- Redirect resolves to the correct destination, `click_count` increments correctly
- Anonymous link dies after 30 days → returns 410
- Sign-in → successfully claims the just-created anonymous link
- Spammy IP is blocked by rate limiting
- Malformed URLs are rejected with a clear message

## OUT — deferred to Phase 2

Custom alias · custom expiration (user-chosen date) · detailed analytics (geo/referrer/device) ·
CMS admin (see [spec-cms.md](./spec-cms.md)) · QR/password/bulk/UTM/API key · editing the destination URL.
