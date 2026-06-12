# F003 — Google sign-in for saved link management

## Purpose
Allow users to optionally sign in with Google to save and manage their links.

## Summary
- Provide a Google OAuth sign-in flow.
- Create or update a user record from the Google profile.
- Establish an authenticated session.
- Grant access to persisted link history and permanent links.
- Claim anonymous links created before sign-in.

## Acceptance criteria
- Users can sign in with Google.
- Authenticated users can see saved links and history.
- Anonymous links created in the current session can be claimed.

## Related API
- `POST /api/auth/google`
