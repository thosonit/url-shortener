# FC-LINKS — Link management

## Purpose
Let admins search, inspect, and act on any link in the system.

## Summary
- Search and filter across all links.
- Apply lifecycle actions (disable/enable, force-expire).

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC-LINKS.1 | Search / filter | By code, URL, owner **email**, or status. (Owner is filtered by the email shown in results, not an internal id.) |
| FC-LINKS.2 | Disable / enable | Flip `links.status` (`active \| disabled`). |
| FC-LINKS.3 | Force-expire | Set `expires_at` to now to retire a link immediately. |
| FC-LINKS.4 | View clicks | Inspect a link's `click_count`. |

## Disable vs force-expire — which to use
The two actions differ in what they disclose at redirect ([[FA-REDIRECT]]):

- **Disable** → redirect returns `404` (indistinguishable from a code that never existed).
  Use for **abuse / takedown** — a takedown should not confirm the code existed.
- **Force-expire** → redirect returns `410 Gone` ("Link expired"), which *does* confirm the
  code existed. Use only for **legitimate retirement**, never for hiding malicious links.

## Acceptance criteria
- Admins can locate links by multiple criteria, including owner email (FC-LINKS.1).
- Disabled links stop resolving at redirect with `404` ([[FA-REDIRECT]]) (FC-LINKS.2).
- Force-expire takes effect immediately, returning `410` at redirect (FC-LINKS.3).
- Click totals are visible per link (FC-LINKS.4).

## Related
- Acts on records from [[FA-SHORTEN]]; reflected in redirect ([[FA-REDIRECT]]) and TTL ([[FA-EXPIRY]]).
