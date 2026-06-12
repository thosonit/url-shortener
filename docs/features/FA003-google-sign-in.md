# FA003 — Google sign-in

## Purpose
Let users optionally sign in with Google to own and manage their links.

## Summary
- Provide a Google OAuth sign-in flow (Auth.js).
- Resolve identity via the `accounts` table, upsert the linked `users` row, then establish a session.
- On first sign-in within a session, claim the anonymous links created in that session.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA003.1 | OAuth flow + user upsert | Sign in with Google; resolve identity via `accounts(provider='google', provider_account_id=sub)` → linked `users` row (create both on first sign-in); establish an authenticated session. Provider identity lives in `accounts`, not on `users` — see [[database]]. |
| FA003.2 | Anonymous link claim | On first sign-in, assign `user_id` and clear `expires_at` for links carrying the visitor's `anon_session_id`. |

## Claim mechanism (FA003.2)
Each visitor holds a signed `anon_session_id` cookie; anonymous links store it. On first sign-in:
```sql
UPDATE links
SET user_id = :userId, expires_at = NULL
WHERE anon_session_id = :anonId AND user_id IS NULL;
```

## Acceptance criteria
- Users can sign in with Google (FA003.1).
- Anonymous links from the current session are claimed on sign-in and become permanent (FA003.2).
- After claim, the links appear in history ([[FA004]]).

## Related API
- `GET /api/auth/signin/google` → begin OAuth (Auth.js)
- `GET /api/auth/callback/google` → upsert identity, establish session, trigger claim

## Related
- Claim flips TTL handled by [[FA005]]; claimed links surface in [[FA004]].
