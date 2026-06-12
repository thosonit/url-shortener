# FC003 — Link management

## Purpose
Let admins search, inspect, and act on any link in the system.

## Summary
- Search and filter across all links.
- Apply lifecycle actions (disable/enable, force-expire).

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC003.1 | Search / filter | By code, URL, owner, or status. |
| FC003.2 | Disable / enable | Flip `links.status` (`active \| disabled`). |
| FC003.3 | Force-expire | Set `expires_at` to now to retire a link immediately. |
| FC003.4 | View clicks | Inspect a link's `click_count`. |

## Acceptance criteria
- Admins can locate links by multiple criteria (FC003.1).
- Disabled links stop resolving at redirect ([[FA002]]) (FC003.2).
- Force-expire takes effect immediately (FC003.3).
- Click totals are visible per link (FC003.4).

## Related
- Acts on records from [[FA001]]; reflected in redirect ([[FA002]]) and TTL ([[FA005]]).
