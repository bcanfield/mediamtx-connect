---
id: 20260716150710
title: path-defaults-no-nav-entry
principal: 2h
interest: +1 support question per operator who can't find where recording is configured
hotspot: apps/web/src/components/app-header.tsx
business_capability: mediamtx-config
payoff_trigger: ticket 02 lands /config/mediamtx/paths/$name, making three MediaMTX config routes behind one nav tab
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

/config/mediamtx/path-defaults is reachable only from the recordings empty-state CTA or by typing the URL. app-header.tsx's tab list still points "MediaMTX Config" at /config/mediamtx/global only, so an operator with existing recordings — who therefore never sees the empty state — has no path to the page where recording is configured. Not an oversight in ticket 01, which specified the CTA as the entry point: ADR 0002 records that the design's board 2e pins eight sections for global config and "specifies no per-path or defaults page", so nav for these routes is undesigned surface. Ticket 02 adds a third MediaMTX config route, which is when one nav tab covering three scopes needs a real answer (sub-nav, or a scope switcher on the config pages).
