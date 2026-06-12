# F004 — Custom aliases / vanity URLs

## Purpose
Let users optionally specify a custom alias instead of an auto-generated short code.

## Summary
- Accept an alias input during link creation.
- Validate alias format and uniqueness.
- Store the alias on the link record.
- Resolve alias lookups in redirect handling.

## Acceptance criteria
- Valid aliases can be created when available.
- Duplicate aliases are rejected with a clear error.
- Alias lookups redirect correctly.

## Notes
Alias moderation is deferred to Phase 2; active aliases are allowed immediately.
