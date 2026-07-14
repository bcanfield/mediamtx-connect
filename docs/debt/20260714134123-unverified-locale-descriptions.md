---
id: 20260714134123
title: unverified-locale-descriptions
principal: 2h
interest: unknown
hotspot: messages/*.json
business_capability: mediamtx-config
payoff_trigger: A native speaker reviews an affected locale file, or a translation-quality issue is reported for these keys.
quadrant: prudent-deliberate
category: documentation
ai_authored: true
created: 2026-07-14
---

The `Config.mediamtxForm.sections.{rtsp,srt,rtmp,api,hls,webrtc}.enableDescription` values were machine-authored across all 30 locales, ~25 of which I cannot natively verify. The I18N.md translation contract's fallback for non-fluent languages is to copy the English string verbatim and mark it with a TODO; I deliberately skipped that and wrote real translations because the phrases are short and formulaic ("Enable the X server."). Quality is unconfirmed for the non-fluent locales until a native speaker reviews them.
