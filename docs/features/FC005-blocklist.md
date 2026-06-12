# FC005 — Blocklist

## Purpose
Block known-bad destination domains at both creation and redirect time.

## Summary
- Maintain a list of banned domains.
- Enforce the list when links are created and when they are resolved.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC005.1 | Domain CRUD | Admins manage `blocklist(domain, reason, added_by, created_at)`. |
| FC005.2 | Enforcement | Block at creation ([[FA001]]) — reject the request — and at redirect ([[FA002]]) — refuse to resolve. |

## Acceptance criteria
- Admins can add/remove banned domains with a reason (FC005.1).
- Creating a link to a blocklisted domain is rejected (FC005.2).
- Resolving an already-created link whose domain is later blocklisted is refused (FC005.2).
- Blocklist edits write audit entries ([[FC007]]).

## Related
- Blocklisted domains can also auto-raise reports in [[FC004]].
