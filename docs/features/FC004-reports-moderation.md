# FC004 — Reports & moderation

## Purpose
Handle abusive or inappropriate links through reactive, report-driven moderation.

## Summary
- Accept reports against links (public report button + automated rules).
- Present an admin queue and let admins resolve each report with a reason.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC004.1 | Report flow | Public "Report link" button on the redirect/preview page creates a `reports` record. Auto-rules also raise reports (e.g. blocklisted domain, IP over the creation threshold). |
| FC004.2 | Resolve | Admin reviews the queue and resolves: disable the link or dismiss, with a `resolution_note`. |

## Acceptance criteria
- Reported links are visible to admins in a queue (FC004.1).
- Auto-rules raise reports without manual input (FC004.1).
- Admins resolve reports with an action and a note; disabling stops resolution (FC004.2).
- Each resolution writes an audit entry ([[FC007]]).

## Notes
Reactive moderation only — there is **no** pending/approval queue. Custom aliases are out of scope, so moderation targets ordinary links.

## Related
- Disable action shares mechanics with [[FC003]]; auto-rules tie into [[FC005]] and [[FA006]].
