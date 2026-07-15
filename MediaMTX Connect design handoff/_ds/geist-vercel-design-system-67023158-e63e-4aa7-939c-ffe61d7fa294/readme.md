# Geist — Vercel Design System

An analysis-derived design system capturing **Vercel's Geist** design language: a stark black-on-near-white developer-platform aesthetic where a single ink tone (`#171717`) carries every heading, CTA, and border, and the only color the page allows itself is a multi-stop mesh gradient confined to the hero.

> **Status: alpha.** This system was built from a written design-language analysis (the "Vercel Analysis" spec), not from Vercel's source code or a Figma file. No proprietary code or private assets were provided. Values (colors, type ramp, spacing, radii, component specs) are transcribed from that spec. Geist Sans and Geist Mono are Vercel's open-source typefaces.

## Sources
- **Primary source:** the pasted "Vercel Analysis" markdown spec (colors, typography, spacing, radius, component definitions, do's & don'ts). No codebase, GitHub repo, or Figma link was attached.
- **Fonts:** Geist + Geist Mono (v1.7.2, OFL), self-hosted as local `.woff2` binaries in `assets/fonts/`, declared via `@font-face` in `tokens/fonts.css`. Weights 400/500/600/700 (sans) and 400/500/600 (mono).
- **Logo:** none provided. The brand mark is rendered as tightly-tracked wordmark type everywhere a logo would appear — see Iconography.

---

## Content Fundamentals

The voice reads like **documentation that happens to be selling something** — engineered, exact, confident.

- **Person / address:** second person, product-forward. "Your complete platform for the web." Benefits are stated as capabilities, not promises.
- **Casing:** sentence case for headlines and body; **UPPERCASE only** on the small Geist Mono eyebrow labels that introduce sections like spec-sheet headers ("DEPLOY · PREVIEW · SHIP").
- **Tone:** terse and technical. Verbs lead ("Deploy in seconds", "Ship AI faster"). No exclamation marks, no hype adjectives stacked up.
- **Length:** headlines are short and declarative (≤ ~8 words); supporting copy is one tight sentence. Whitespace, not words, does the persuading.
- **Emoji:** none. The brand never uses emoji in product or marketing chrome.
- **Numbers / metrics:** used sparingly and only when concrete ("down to the millisecond", "$20 / month"). Avoid decorative stats.
- **Examples:** eyebrow → "DEVELOP · PREVIEW · SHIP"; hero → "Your complete platform for the web."; CTA → "Ready to deploy?" / "Start Deploying"; feature → "Fluid compute — Pay only for what you use, down to the millisecond."

---

## Visual Foundations

- **Palette:** a black-and-white duet. Near-black ink `#171717` on a near-white canvas `#fafafa`, with white `#ffffff` cards. Text steps down a deliberate grey ladder: ink → body `#4d4d4d` → mute `#8f8f8f` → faint `#a1a1a1`. Body copy is **never pure black** — the brand's ink is `#171717`.
- **Accent discipline:** the only saturated color allowed as chrome is Vercel blue `#0070f3` (links, focus, highlights). Violet / cyan / pink / magenta live **only** in the hero mesh gradient and illustration accents — never as surface fills.
- **The one flourish:** a soft multi-stop **mesh gradient** (cyan → blue → violet → magenta → amber) blooms behind the hero headline. It is the entire decorative system; there is no second one. The legacy Vercel gradient trio survives as named accents: Develop (blue→cyan), Preview (violet→pink), Ship (red→amber).
- **Type:** Geist Sans for everything (display + prose), Geist Mono for code and uppercase eyebrows. Weight is binary — 600 for headings, 500 for buttons/labels, 400 for body. No light weight, no italic. Display type carries **tight negative tracking** (-2.4px at 48px hero, -1.28px at 32px section); body sits at neutral spacing. The larger the heading, the tighter.
- **Spacing:** 4px base scale (4 → 8 → 12 → 16 → 24 → 32 → 40 → 64 → 96 → 128). Card interiors 24–32px; section bands 96–128px of vertical rhythm. Whitespace is structural — the near-white canvas and big vertical gaps do the separating, not heavy backgrounds.
- **Borders:** the **1px hairline** `#ebebeb` is the structural workhorse — it defines every card, input, and divider before any shadow is considered.
- **Elevation:** deliberately minimal, hairline-first. Level 0 = flat 1px border, no shadow (the default). Level 1 = whisper `0 1px 1px rgba(0,0,0,.04)`. Level 2 = a finely-layered low-alpha stack for menus/modals. Never a single heavy drop shadow.
- **Corner radii:** bimodal. Tight **6px squares** for functional chrome (nav/app buttons, inputs); full **pills** (100px) for marketing CTAs and 64px for category tabs; **12–16px** on content cards in between; circles for icon buttons and avatars.
- **Cards:** white on the `#fafafa` canvas, separated by a 1px hairline, 12–16px radius, flat by default. Depth via border + whisper shadow, never heavy elevation.
- **Backgrounds:** flat near-white. No photography, no textures, no repeating patterns. Feature illustrations are ink-on-white vector (node graphs, code editors).
- **Hover / press:** subtle. Links and nav items darken from body-grey to ink (and pick up a faint hairline-soft fill); buttons ease opacity/background; press nudges a slight `scale(0.97)`. Transitions are quick (~.15s ease), no bounce.
- **Transparency / blur:** used only in the hero mesh (blurred radial bloom). Chrome is opaque.
- **Imagery vibe:** none by default — the system is text-and-vector. Any illustration is ink-on-white line work.

---

## Iconography

- **No icon assets were provided** with the source spec, and none are bundled. The system does not ship a proprietary icon font or SVG set.
- **Substitution / recommendation:** for real work, pair Geist with a **thin-stroke line icon set** — the closest CDN match to Vercel's own [`geist-icons`](https://vercel.com/geist/icons) house style is **[Lucide](https://lucide.dev)** (16–24px, ~1.5px stroke, rounded joins) or **Feather**. Link from CDN and keep glyphs ink `#171717` or mute `#8f8f8f`. **Flag:** this is a substitution, not Vercel's real icon set — supply `geist-icons` if you need exact parity.
- **Emoji:** never used.
- **Unicode as icons:** the recreations use a few unicode glyphs as lightweight stand-ins (e.g. `→` in the carousel `IconButton`, `▲` / `✓` in terminal output). Replace with real line icons in production.
- **Logo:** no mark provided — rendered as the wordmark in Geist Sans 600 with tight tracking wherever a logo would sit (nav, footer, thumbnail). **Do not** reconstruct Vercel's triangle mark from memory.

---

## Components

Reusable primitives, exactly matching the families the source spec defines. Namespace: `window.GeistVercelDesignSystem_670231`.

- **Button** (`components/buttons/`) — context-driven: `primary`/`secondary`/`ghost`/`danger`; `lg` marketing pills (40px), `md` nav/app squares (32px); `shape` override for pill / square / 64px category tab.
- **IconButton** (`components/buttons/`) — circular icon / carousel control, white + hairline.
- **Input** (`components/forms/`) — default text field with label, hint, and error states; ink-on-focus.
- **Card** (`components/cards/`) — the workhorse hairline tile; `elevation` 0/1/2, `radius` sm/md/lg (feature → pricing), eyebrow + title slots.
- **CodeBlock** (`components/content/`) — code / terminal surface in Geist Mono, optional filename bar and traffic-light chrome.
- **NavBar** (`components/navigation/`) — top navigation: wordmark, ghost pill links, action buttons, bottom hairline.
- **Hero** (`components/bands/`) — full-width hero band; the only place the mesh gradient is allowed.
- **CTABand** (`components/bands/`) — centered end-of-page call-to-action.
- **LogoStrip** (`components/bands/`) — greyscale customer-wordmark band.
- **Footer** (`components/bands/`) — wordmark + multi-column link groups.

_No "Intentional additions": every component maps to a family in the source spec (nav-bar/nav-link → NavBar, the button family → Button/IconButton, text-input → Input, feature/pricing/code cards → Card/CodeBlock, the bands → Hero/CTABand/LogoStrip/Footer)._

---

## Index / Manifest

- `styles.css` — root entry; `@import`s all tokens + fonts. **Consumers link this one file.**
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `shadow.css`, `fonts.css`.
- `components/` — `buttons/`, `forms/`, `cards/`, `content/`, `navigation/`, `bands/` (each: `.jsx` + `.d.ts` + `.prompt.md` + `@dsCard` HTML).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing groups).
- `ui_kits/marketing/` — full landing-page recreation (`index.html`, `MarketingPage.jsx`, `README.md`).
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent Skills manifest.

## Caveats
- Built from a written spec only — no code/Figma source of truth. Treat exact pixel fidelity as approximate.
- Fonts self-hosted locally (`assets/fonts/`) — no network dependency.
- No logo or icon assets — wordmark type + a flagged Lucide substitution stand in.
