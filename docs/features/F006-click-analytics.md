# F006 — Click analytics

## Purpose
Show users and the system how many times each link has been clicked.

## Summary
- Track a click counter on each link.
- Increment the counter on successful redirects.
- Expose the count in user history and APIs.

## Acceptance criteria
- Clicks are counted for every successful redirect.
- The count is available in response data for links.
- Stored counts are consistent and increment atomically.
