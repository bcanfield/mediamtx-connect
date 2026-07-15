---
name: geist-vercel-design
description: Use this skill to generate well-branded interfaces and assets in Vercel's Geist design language — stark black-on-near-white, single-ink chrome, tight-tracked Geist type, marketing pills vs 6px app squares, and a hero-only mesh gradient. For production or throwaway prototypes/mocks. Contains design guidelines, colors, type, fonts, and UI kit components.
user-invocable: true
---

Read the `readme.md` file within this skill first — it carries the content fundamentals, visual foundations, iconography rules, and the component index. Then explore the other files:

- `styles.css` + `tokens/` — the CSS custom properties (colors, type ramp, spacing, radii, shadows) and font-face loading. Link `styles.css` to inherit the real tokens.
- `components/` — reusable React primitives (Button, IconButton, Input, Card, CodeBlock, NavBar, Hero, CTABand, LogoStrip, Footer), each with a `.prompt.md` usage note.
- `ui_kits/marketing/` — a full landing-page recreation composing those components.
- `guidelines/` — foundation specimen cards.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Hold the line on the system's discipline: near-black ink on near-white canvas, color confined to the hero mesh and links, marketing CTAs as black pills and app/nav controls as 6px squares, 1px hairlines before shadows, and tight negative tracking on display type. No emoji, no second decorative system.

If the user invokes this skill without other guidance, ask what they want to build, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_ production code depending on the need.
