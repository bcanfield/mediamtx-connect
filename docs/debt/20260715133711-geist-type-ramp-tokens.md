---
id: 20260715133711
title: geist-type-ramp-tokens
principal: 4h
interest: +few min per new feature page; ramp can drift
hotspot: apps/web/src/globals.css
business_capability: web-ui
payoff_trigger: next design-token change, or a new feature page retyping the ramp
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

The Geist arbitrary type ramp (text-[13px], text-[12.5px], text-[11.5px], text-[10.5px], tracking-[-0.02em]) is retyped per call site across apps/web instead of being promoted to @theme --text-* tokens in globals.css. The 2026-07 audit fix pass promoted only the 10px radius (--radius-panel) and overlay shadow, and pushed form label/description sizes into ui/form.tsx defaults; the rest of the ramp stays as arbitrary values because it is consistent local idiom from the design handoff and a full sweep was out of scope. Symptom: every new component restates the ramp by hand, and nothing enforces it.

**Resolved (2026-07-28, issue 217).** `globals.css` now names all nine ramp steps as `@theme` tokens — `--text-section` 15px, `--text-body` 13.5px, `--text-control` 13px, `--text-row` 12.5px, `--text-lead` 12px, `--text-meta` 11.5px, `--text-status` 11px, `--text-label` 10.5px, `--text-micro` 10px — plus `--tracking-title` for the heading tracking, and 76 call sites across 24 files use them. The four sizes this entry named were only half the ramp; tokenizing those alone would have left the same "restate it by hand" problem for the other five. No `--*--line-height` companions, so the utilities set font-size only, exactly like the arbitrary values they replace. `cn()` had to learn the ramp (`extendTailwindMerge` in `lib/utils.ts`) — tailwind-merge classified `text-[13px]` as a font size but reads a bare `text-control` as a colour, which would have quietly stopped `FormLabel` from overriding `Label`'s `text-sm`. Two things this does not cover: the uppercase tracking values (0.06/0.07/0.08em) are still arbitrary — three values for one role is a design decision, not a rename — and nothing lint-bans a new `text-[13px]`; the natural home, a `no-restricted-syntax` block over `apps/web/src`, would collide with the i18n block that already owns that rule for `features/**` and `components/**`.
