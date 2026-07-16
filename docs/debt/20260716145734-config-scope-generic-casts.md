---
id: 20260716145734
title: config-scope-generic-casts
principal: 2h
interest: +15min per developer who adds a scope and hits the cast wall
hotspot: apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx
business_capability: mediamtx-config
payoff_trigger: a third scope (path config, ticket 02) needs a section type the casts don't cover
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

Parameterizing MediaMTXConfigForm by scope needed three type escapes: `zodResolver(scope.schema) as Resolver<T, unknown, T>`, `defaultValues: conf as never`, and casting the control to Control<GlobalConfigFormData> for IceServersRows. The generic T can't prove to react-hook-form that ConfigScope pairs its schema with matching section descriptors, and webrtcICEServers2 exists only on the global scope while `hasIceServers` sits on the shared SectionDef. The casts are sound today because ConfigScope is only constructed at two module-level sites with matching schema/sections pairs, but nothing in the type system enforces that pairing — a mismatched scope would typecheck and fail at runtime.
