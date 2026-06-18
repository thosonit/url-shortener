# ShortLink · Design & Build Spec

A handoff spec for rebuilding this UI in a production codebase. The reference
implementation in this folder is a single interactive React prototype
(`index.html` + `*.jsx` loaded via Babel). Use it as the source of truth for
layout, states, and micro-interactions; this document captures the system so you
don't have to reverse-engineer the CSS.

> **Style in one line:** Swiss / functional with personality — generous
> whitespace, strong type hierarchy, ONE confident indigo accent, soft layered
> shadows (not flat), rounded-but-not-pill corners, restrained micro-interactions.

---

## 1. Files in this package

| File | Role |
|---|---|
| `index.html` | Entry point. Loads fonts, the QR lib, and the app scripts. Also contains the **preview-frame chrome** (device presets + States menu) — that chrome is a *prototype harness*, NOT part of the product. Do not ship it. |
| `styles.css` | The real design system: tokens, components, container-query breakpoints. **This is the canonical reference.** |
| `components.jsx` | Icon set (inline SVG), `Button`, `QRCode`, `GoogleG`. |
| `screens.jsx` | `HomeScreen`, `SignInScreen`, `HistoryScreen`, `Interstitial`, `QRModal` + helpers. |
| `app.jsx` | State machine, top nav, footer, the preview frame, tweaks wiring. |
| `tweaks-panel.jsx` | Prototype-only tweak controls (hero layout + accent). Not part of the product. |

**Recommended production stack:** React + TypeScript + Tailwind (or CSS Modules).
Port the tokens in §3 to your token system. Drop the Babel/CDN setup and the
preview-frame harness.

---

## 2. Product

A clean, fast link-shortening utility. Hero action: **paste a long URL → get a
short link instantly.** Signed-in users save & manage links. No marketing fluff.

Fake brand used throughout: wordmark **`sho.rt`**, short links look like
`sho.rt/k7Pq2`. Replace with the real brand.

---

## 3. Design tokens

A **single `--accent`** drives every accent shade via `color-mix` — change one
value to re-theme. Colors are authored in `oklch`.

```css
:root {
  /* accent — electric indigo (~264 hue), one source of truth */
  --accent:        oklch(0.55 0.24 264);
  --accent-hover:  color-mix(in oklch, var(--accent), black 13%);
  --accent-press:  color-mix(in oklch, var(--accent), black 24%);
  --accent-ring:   color-mix(in oklch, var(--accent), transparent 60%);
  --accent-tint:   color-mix(in oklch, var(--accent), white 91%);
  --accent-tint-2: color-mix(in oklch, var(--accent), white 83%);
  --on-accent:     oklch(0.99 0.01 264);

  /* neutral surfaces (near-white) */
  --bg:        oklch(0.985 0.004 264);
  --surface:   oklch(1 0 0);
  --surface-2: oklch(0.975 0.005 264);
  --surface-3: oklch(0.955 0.006 264);

  /* ink (near-black) */
  --ink:       oklch(0.20 0.02 264);
  --ink-2:     oklch(0.40 0.018 264);
  --ink-3:     oklch(0.55 0.015 264);
  --ink-faint: oklch(0.68 0.012 264);

  /* lines */
  --line:   oklch(0.91 0.006 264);
  --line-2: oklch(0.86 0.008 264);

  /* semantic */
  --success:      oklch(0.58 0.15 152);   --success-tint: oklch(0.96 0.04 152);
  --warning:      oklch(0.70 0.15 70);    --warning-tint: oklch(0.96 0.05 75);
  --error:        oklch(0.57 0.21 25);    --error-tint:   oklch(0.96 0.04 25);

  /* radius — rounded but NOT pill */
  --r-sm: 7px;  --r-md: 11px;  --r-lg: 15px;  --r-xl: 22px;

  /* soft, layered shadows (never flat) */
  --sh-1: 0 1px 2px oklch(0.4 0.05 264 / .06), 0 1px 1px oklch(0.4 0.05 264 / .04);
  --sh-2: 0 2px 4px oklch(0.4 0.05 264 / .06), 0 4px 12px oklch(0.4 0.05 264 / .07);
  --sh-3: 0 4px 10px oklch(0.4 0.05 264 / .07), 0 16px 40px oklch(0.4 0.05 264 / .10);
  --sh-accent: 0 4px 14px color-mix(in oklch, var(--accent), transparent 70%);
}
```

### Typography
- **Display / hero:** `Space Grotesk` (600). Big scale, tight tracking (`-0.03em`).
- **UI / body:** `Inter Tight` (400/500/600/700).
- Hero headline: `clamp(34px, 7.2cqi, 64px)`, line-height ~1.02.
- Body/sub: 15–18.5px. Table/meta: 13–14.5px. Never below 13px.
- Use `font-variant-numeric: tabular-nums` for click counts & dates.
- Google Fonts import:
  `Space+Grotesk:wght@400;500;600;700` + `Inter+Tight:wght@400;500;600;700`.

### Spacing & shape
- Container max-width **1120px**; the shorten column caps at **~640–720px**.
- Section padding generous (hero `clamp(40px,8cqi,96px)` top).
- Inputs/buttons height **48–56px**; icon buttons **36–40px** (≥44px hit area on touch).
- Borders `1px var(--line)` (inputs `1.5px var(--line-2)`).

---

## 4. Components

**Button** (`.btn`): primary = solid `--accent`, `--on-accent` text, `--sh-accent`.
Variants: `ghost` (1px border, transparent), `subtle` (accent-tint bg, accent text).
Hover darkens to `--accent-hover`; active `translateY(1px) scale(.99)` + `--accent-press`.
Focus-visible: `0 0 0 3px var(--surface), 0 0 0 6px var(--accent-ring)`.

**Input** (`.input`): 56px, `1.5px` border, `surface-2` bg. Focus → accent border +
`0 0 0 4px var(--accent-ring)` + white bg. Invalid → error border + `--error-tint` bg.

**Icon button** (`.iconbtn`): square, 1px border, hover lifts bg; success variant
swaps to success colors (used for the "copied" tick).

**Pill / badge:** `forever` (accent-tint + accent), `ok` (surface-3 + ink-3),
`soon` (warning-tint, used when ≤7 days to expiry). Status badge "Ready" = success.

**Card surfaces:** white, 1px `--line`, `--sh-2`/`--sh-3`, radius `--r-lg`/`--r-xl`.

Icons are inline SVG, 1.6px stroke, `currentColor`, 24×24 viewBox (see
`components.jsx` for the full set: link, scissors, copy, check, qr, clock,
calendar, cursor/clicks, infinity, ghost, shield, google, …).

---

## 5. Screens & states

### 5.1 Landing / Shorten (home)
- Eyebrow chip ("Free · No account needed") → hero headline → sub.
- **Shorten box** (focal card): URL input (leading link icon) + "Shorten" button.
  Below: a collapsible **expiry** control → chips `7d / 30d (default) / 90d /
  Custom` (signed-in adds **Forever**); Custom reveals a native date picker.
- **States:**
  - `idle` — empty/default.
  - `loading` — button shows spinner (~0.8s simulated).
  - `error-invalid` — input goes red, inline red alert ("That doesn't look like a
    valid URL…"). Validate by normalizing (prepend `https://` if missing) then
    `new URL()` + hostname must contain a dot.
  - `error-rate` — amber alert ("Too many links from your network… try later, or
    sign in"). In the prototype this triggers after >5 anonymous links; production
    uses the real server signal.
  - `success` — **Result card** appears (animate in): label + "Ready" badge; the
    short URL (accent, Space Grotesk) with a **Copy** button (turns green + "Copied"
    for ~2.2s); original URL truncated (middle-ellipsis); meta row (clicks, created);
    a **real QR** (qrcode lib) with an "Enlarge QR" → modal; footer note:
    *"Expires in N days — sign in to keep it forever"* (or *"This link never
    expires"* when signed in) + "Shorten another".
- **Mobile:** input + button stack; a **sticky bottom action** appears while
  there's input and no result yet.

### 5.2 Sign in
Minimal centered card: scissors mark, "Sign in to sho.rt", one **Continue with
Google** button (real multicolor G), info note: *"Any links you created before
signing in will be claimed to your account and kept forever"* (shows the pending
count if any), legal line. Button shows a spinner while signing in (~0.9s).

### 5.3 Link history (signed-in)
- Header: "Your links", subtitle = count + total clicks; search box; "New" button.
- **Wide (>640px): table** — columns: Short link (code chip) · Destination
  (url truncated + host) · Clicks (tabular) · Created · Expires (pill) · row
  actions (Copy, QR). Row hover tints accent.
- **Narrow (≤640px): card list** — each card = code chip + expiry pill, url,
  then clicks/date + Copy/QR actions.
- **Empty state:** glyph, "No links yet", copy, "Shorten your first link" CTA.
- **Loading:** shimmer **skeleton** rows (table) / skeleton cards (mobile).
- Copy action fires a toast ("Link copied").

### 5.4 Redirect interstitials
Full-screen centered. Big gradient **404** ("Link not found" — ghost glyph) and
**410** ("This link has expired" — clock glyph, warning-tinted). Each shows the
offending code in a mono chip and 2 CTAs (Shorten / Go home, or Sign in to keep
links). No footer on these pages.

---

## 6. Responsive rules

Layout responds to the **app width** (use container queries, or component width —
the prototype uses `container-type: inline-size` on `.app-canvas`). Breakpoints:

| Width | Treatment |
|---|---|
| **≤480 (mobile, 375)** | Single column; input + button stack; sticky bottom action; QR scales down; nav label may hide; padding 16px. |
| **≤640** | History **table → cards**; result card stacks QR above. |
| **≤900 (tablet, 768)** | Tighter padding; two-column where it earns it; table still shown. |
| **>900 (desktop, 1440)** | Content centered, shorten column ~640–720px, wide history table. |

Hard rules: **no horizontal overflow at 320px**, **touch targets ≥44px**.

---

## 7. Interaction & state model

State the app tracks: `screen` (home/signin/history/404/410), `signedIn`,
`links[]`, `createCount`, plus per-screen UI state (input, status, result, copied,
ttl, search, qrModal, toast).

- **Create link:** validate → 0.8s loading → push `{code, shortUrl, url,
  createdAt, expiresAt, clicks, owner}` to `links`. `expiresAt = null` ⇒ forever.
- **Anonymous vs signed-in:** anonymous links get `owner: null` and a 30-day
  expiry; **on sign-in they're claimed** (`owner = me`, `expiresAt = null`).
- **Copy:** `navigator.clipboard.writeText`, then show "Copied" state ~2.2s.
- QR generated client-side from the full `https://sho.rt/<code>` URL.

---

## 8. Accessibility & motion

- Visible focus rings on every interactive element (the `--accent-ring` pattern).
- WCAG AA contrast (ink on surface; accent on white passes for text/icons).
- `aria-invalid` on the URL field; `role="alert"` on inline errors; `aria-live`
  on the copy button; labelled icon buttons; QR has an `aria-label`.
- Modal closes on Esc and scrim click.
- Respect `prefers-reduced-motion: reduce` — disable entrance/transition animation.
- Entrance animations should animate *from* hidden to a visible base state (so
  no-JS / reduced-motion / print still shows content).

---

## 9. Things to replace before shipping

- Strip the **preview-frame chrome** and **States menu** in `index.html`, and the
  **tweaks panel** — all are prototype-only harnesses.
- Swap the fake `sho.rt` brand, the seeded history data, and the simulated
  timeouts/rate-limit rule for real API calls and auth.
- Replace the CDN QR lib with your bundled equivalent.
```
