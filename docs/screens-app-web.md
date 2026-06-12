# App / Web Screens

## Screen index

- Create-link page
- History page
- Link expired page
- Sign-in / auth flow

## Create-link page

Purpose: let users shorten a URL quickly.

Content:
- Input field for the original URL
- Submit button
- Validation errors for invalid URLs or self-referential links
- Copy button for the generated short link
- Optional Google sign-in call-to-action
- Anonymous usage explanation and expiry note

## History page

Purpose: surface saved links for authenticated users.

Content:
- List of user-owned links
- Original URL, short code, click count, and expiration status
- Copy / open / delete actions
- Link claim state after sign-in for anonymous-created links

## Link expired page

Purpose: handle expired short codes gracefully.

Content:
- 410 status message
- Explanation that the link has expired
- Option to create a new short link

## Sign-in flow

Purpose: allow users to move from anonymous usage to authenticated sessions.

Content:
- Google sign-in button
- Post-sign-in confirmation
- Automatic claim of anonymous links created during the current session
