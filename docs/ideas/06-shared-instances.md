# Ideas: Shared & public instances

> **Status: ideas, not implemented.** Brainstorm only — nothing in this file is shipped. Shipped features live in [`docs/FEATURES.md`](../FEATURES.md). See [`00-index.md`](./00-index.md) for context. The deployment side of the public demo lives in [`docs/HOSTED-DEMO.md`](../HOSTED-DEMO.md).

Connect today assumes one person, who owns the box and may change anything. Two situations break that assumption and turn out to need the same features:

- **A public demo.** Anonymous strangers should see a working dashboard, and must not be able to wreck it for the next visitor.
- **A shared install.** A team, household, school, or club: the owner wants members to watch the cameras and browse recordings, while config stays with whoever runs it.

This file is a menu of what those two need. It's a feature catalog, not a design — no ordering, no architecture, no commitment.

## The constraint worth knowing up front

MediaMTX's permission actions are `publish`, `read`, `playback`, `api`, `metrics`, and `pprof`, and **`api` is all-or-nothing** — there's no upstream "read the server state but don't change it" tier. So a viewer tier is something Connect has to offer; MediaMTX can't be asked for it. What MediaMTX *can* supply is the policy behind it: `authInternalUsers` already models users, per-path patterns, and who may do what.

---

## 1. Getting in

- **Anonymous viewing** — the instance is usable with no login at all. The demo's default; also what most households want.
- **Login wall** — the opposite switch: nothing at all until you authenticate. For an instance reachable from the internet with real cameras on it.
- **Admin sign-in** — one shared credential is enough for most shared installs, and is the whole story for the demo.
- **Named operators** — several people who can be told apart, so activity and announcements have an author. MediaMTX's `authInternalUsers` is the obvious place to source them from, rather than a second list of people to maintain.
- **Sign out / session expiry** — a shared browser on a kitchen tablet shouldn't stay admin forever.
- **"View as a member"** — an admin temporarily sees what a viewer sees. The only reliable way to check what you've exposed, and on the demo it's the feature that lets a visitor experience both modes.
- **Guest links** — access to the instance, or one stream, via a URL with no account. Covered further in §5.

## 2. What a viewer is allowed to do

The useful unit isn't a role, it's a list of switches an operator recognises. Some of these are non-obvious and matter more than they look:

| Capability | Note |
|---|---|
| See the live grid | The baseline. Both audiences say yes. |
| Play a stream | Both yes. |
| See telemetry (codecs, viewers, uptime) | Usually yes; some operators consider viewer counts private. |
| **Copy publish URLs** | Easy to overlook: this hands someone the RTSP/RTMP/SRT **ingest** address for your server. Arguably admin-only on a shared install. |
| Take a snapshot | Writes a file and spawns work on the server — a plausible spam vector on a public instance. |
| Browse recordings | Both yes. |
| Play a recording inline | Both yes. |
| **Download a recording** | Genuinely separate from watching. "Members can review footage but not export it" is a real policy. |
| Toggle recording on a path | Admin. |
| View config read-only | The shared install's actual request — "let them *see* how it's set up" — and harmless. |
| Edit MediaMTX config / path config / hooks | Admin. |
| Edit app config (storage locations, server URL) | Admin, and see §6. |
| Kick a live session | Admin. |

## 3. What a viewer can see

- **Per-path visibility** — the single most-requested shape of this: "the interns see the lobby cam and nothing else." MediaMTX already carries the data in `authInternalUsers[].permissions[].path`, including tilde-prefixed regex.
- **A per-path "visible to members" flag** — the cheap alternative to ACL-derived scoping: a checkbox per path instead of a permission model. Worth considering as the version that actually gets used.
- **Recordings inherit stream visibility** — a path you can't watch shouldn't have a browsable archive.
- **Hide server identity from viewers** — the MediaMTX URL, ports, and version are on screen today. On a public instance that's reconnaissance; on a shared one it's just noise.
- **Redact publish URLs** — the ingest-address concern from §2, applied to the empty-state hints as well as to the card menu.
- **Hide empty or offline paths** — an operator's fleet has junk in it; members shouldn't see the junk.

## 4. Announcements & instance presentation

The category that makes an instance feel like *someone's*, rather than like a stock app. Both audiences need it, for different messages — "public demo, resets hourly" vs "read-only for members, ping #ops."

### The banner itself

- **Global banner** — operator-written text across the top of every page. The workhorse.
- **Severity** — info / warning / critical, with colour to match. "New camera added" and "recordings stop Friday" shouldn't look alike.
- **Dismissible vs sticky** — some notices are read-once; some must stay until the situation ends. Dismissal remembered per visitor.
- **Scheduled windows** — a start and end time, so "maintenance Saturday 02:00" can be written on Tuesday and disappear on its own. The one feature that stops banners going stale, which is how banners die.
- **Several at once** — a real instance can have a maintenance notice and a house rule simultaneously. A stack, not one slot.
- **Links and light formatting** — a banner that can't link to the incident doc gets ignored.
- **Audience targeting** — show to viewers only, admins only, or everyone. "Read-only for members" is noise to the admin; "disk 92% full" is noise to members.

### Beyond the banner

- **Automatic banners from system state** — derived, not written: MediaMTX unreachable, disk nearly full, retention about to delete a lot, a path offline for days, an upstream version with a breaking change. This is where a banner system pays for itself on a private install too.
- **Instance name and subtitle** — "Warehouse Cams" in the header and the browser tab. Matters enormously the moment someone runs two of these.
- **Light branding** — a logo and an accent colour. Enough to tell instances apart at a glance; not a theming engine.
- **Welcome / first-visit panel** — richer than a banner and shown once: house rules for a shared install, a "here's what to look at" tour for the demo.
- **Per-stream notes** — an operator annotation on a card: "offline for maintenance", "audio disabled on purpose", "faces blurred". Answers the questions members would otherwise ask.
- **Per-page notices** — a line on the Recordings page explaining retention; a line on Config explaining why it's read-only. Context where the confusion actually happens.
- **Support / contact link** — "something wrong? → #ops". Every shared install invents this in a sticky note otherwise.
- **Empty-state override** — what a member sees when there are no streams should be the operator's words, not publish instructions they can't act on.
- **Maintenance mode** — the whole instance shows a single explanatory page while admins still get in.
- **Instance changelog** — a short log of what the operator changed, visible to members. Turns "why did the driveway cam move?" into a link.
- **A countdown** — "resets in 14 minutes". Demo-shaped, but it's just a scheduled banner that can render a timer.

## 5. Share-outs

- **Kiosk view** — one stream, no chrome, for a wall-mounted screen or a tablet by the door.
- **Multi-cam wall** — fullscreen grid, optional auto-cycle, no navigation.
- **Embed snippet** — an iframe or `<video>` for a house dashboard, a wiki, or a Home Assistant panel.
- **Scoped share link** — a URL granting one path for a limited time, no account. "Send the neighbour the driveway cam for the weekend."
- **QR code for a share link** — sounds frivolous until someone is standing in front of the camera trying to show a colleague.
- **Public gallery** — a curated subset presented as a page rather than as the admin dashboard.

## 6. Making anonymous exposure survivable

- **Lock the app-config surface** — storage locations and the server URL become admin-only, optionally pinned so even an admin can't repoint them from the UI. This is what stops a member — or a demo visitor — aiming the recordings browser at an arbitrary directory, and it's the cheapest safety item in this file.
- **Change history** — who changed what, when, and to what. Accountability on a shared install; on the demo, a genuinely interesting record of what strangers try.
- **Diff preview before saving** — see the change that's about to be sent. Connect already writes sparse patches; this makes them visible.
- **Baseline and restore** — a known-good snapshot and a one-click revert. The shared install's undo, and the demo's reset.
- **Scheduled auto-reset** — the same restore on a timer. Demo-only, but harmless elsewhere.
- **Global freeze** — make the whole instance read-only for everyone, admins included, during an incident or a handover.
- **Concurrent viewer caps** — MediaMTX's per-path `maxReaders`. Bandwidth control on a shared install; egress control on a public one.
- **Rate limits on expensive actions** — snapshot capture and thumbnail generation spawn real work per click.

## 7. Knowing what's going on

- **Live sessions with kick** — who is watching, from where, for how long. MediaMTX exposes all of it (`*/sessions/list`, `*conns/list`, `*Kick`).
- **Who is signed in** — the Connect-side equivalent, for named operators.
- **Recent activity** — a feed combining config changes, sign-ins, and kicks.
- **Alerts** — tell the operator when a path goes offline, when the disk fills, or when a viewer is refused access, instead of waiting for a complaint.

---

## Which audience needs what

| | Public demo | Shared install |
|---|---|---|
| Anonymous viewing | required | usually |
| Login wall | no | sometimes |
| Admin sign-in | yes — trying it *is* the demo, with credentials on the page | yes, private |
| Named operators | no | yes, once there's more than one |
| Viewer capability switches | yes | yes |
| Per-path visibility | no — show everything | **the main requirement** |
| Global banner + scheduling | yes | yes |
| Automatic system banners | useful | **more useful** |
| Instance name / branding | nice | yes |
| Welcome panel | yes — as a tour | yes — as house rules |
| Per-stream notes | no | yes |
| Kiosk / wall / embed | nice | yes |
| Scoped share links | yes — deep-link a stream | yes |
| Lock app-config | **required** | yes |
| Change history | yes — as research | yes — as accountability |
| Baseline + restore | **required** | yes |
| Scheduled auto-reset | yes | no |
| Sessions + kick | nice | yes |

The overlap is almost the whole list. The genuine divergences are three: the demo wants scheduled resets and publishes its admin credential; the shared install wants per-path scoping and named operators. Everything else is the same feature with different text in it.

## The smallest set that satisfies both

If only a handful ever get built, these are the ones that unlock the two situations:

1. A viewer tier with capability switches (§2).
2. Anonymous-viewing on/off, plus an admin sign-in (§1).
3. A global banner with severity and scheduling (§4).
4. Locking the app-config surface (§6).
5. Baseline and restore (§6).

That set makes a public instance safe to leave running and a shared instance useful to members. Per-path visibility (§3) is the first thing to add after, and is the one item a shared install will ask for unprompted.

## What this deliberately doesn't need

- **A role system.** Two tiers cover both situations. Custom roles, permission matrices, and group hierarchies can wait until someone asks twice.
- **A user database.** Sourcing people from MediaMTX's own user list keeps the "no database" property that makes this app easy to run.
- **SSO, 2FA, magic links.** They live in [`04-auth-security-hooks.md`](./04-auth-security-hooks.md) and can stay there.
- **A theming engine.** A name, a logo, and an accent colour — not a design system per instance.
