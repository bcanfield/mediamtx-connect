# Hosted public demo — design

> **Status: proposed, not deployed.** This is the plan for putting a public, always-on
> instance of MediaMTX Connect on the internet. Nothing here is shipped. When it goes
> live, this file becomes the runbook and the demo URL lands in `README.md`.

## 1. What the demo has to prove

A visitor arriving from GitHub should, inside ~10 seconds and with no signup, see the
three things the README claims:

1. **Live view** — a grid of camera-shaped streams that actually play in their browser,
   with codec chips, viewer counts, uptime, and honest record state.
2. **Recordings** — real MP4s grouped by day, with thumbnails, an inline seekable
   player, and a working download.
3. **Config without YAML** — the 65-control server config, path defaults, per-path
   overrides, and the `runOn*` hooks, all editable and saveable.

Non-goals: multi-tenancy, persistence of a visitor's edits, an SLA, or low-latency
claims about synthetic footage.

## 2. The four constraints that decide the design

**a. The app is a write surface, and the demo is anonymous.** The config editor is a
headline feature, so gating it behind read-only mode guts the demo. Visitors must be
able to save — which means the whole stack needs to be disposable and reset on a timer.

**b. The browser talks to MediaMTX directly, on MediaMTX's own ports.** `hlsUrlFor()`
builds `${remoteMediaMtxUrl}${hlsAddress}/<path>/index.m3u8` and `whepUrlFor()` builds
`${remoteMediaMtxUrl}${webrtcAddress}/<path>/whep` (`apps/web/src/lib/playback.ts`),
where `hlsAddress`/`webrtcAddress` are read from MediaMTX's *own* config over the API —
i.e. `:8888` and `:8889`. The app never proxies media. So the demo needs TLS on those
two non-standard ports, on a host the browser can reach, or the page (HTTPS) will refuse
the requests as mixed content.

**c. WebRTC needs UDP and a routable candidate.** `webrtcLocalUDPAddress: :8189` must be
reachable, and `webrtcAdditionalHosts` must carry the public address — the shipped
`mediamtx.yml` hardcodes `127.0.0.1`, which is exactly the trap recorded in
`docs/debt/20260717102450-webrtc-ice-host-hardcoded-localhost.md`. Get this wrong and
WHEP negotiates, ICE times out after 8s, and the player silently falls back to HLS. The
demo is the first deployment reached from another machine, so it is that debt item's
payoff trigger. This rules out PaaS platforms that only forward HTTP (Render, Railway,
Cloudflare Tunnel) if we want the `LOW-LAT` mode to be honest.

**d. Cheap, and cheap to keep alive.** Target under ~$6/month all-in and near-zero
recurring human attention. Every line of demo-only code in `apps/` or `packages/` is a
tax on every future PR — the design goal is **zero application code**.

## 3. Options considered

| Option | Live WebRTC | Cost/mo | New code | Verdict |
|---|---|---|---|---|
| **Small VPS + docker compose + Caddy** | yes (UDP + ICE-TCP) | ~$5 | 5 deploy files, 0 app files | **Recommended** |
| Fly.io, two apps | yes (needs dedicated IPv4, +$2) | ~$7 | 2 `fly.toml` + volume wiring, 0 app files | Viable alternative, more platform-specific config |
| Oracle Cloud Always Free (ARM) | yes | $0 | same as VPS | Same shape, $0, but capacity/reclamation risk — fine as a cost-down later |
| Render / Railway / Cloudflare Tunnel | **no** (HTTP only) | ~$5 | moderate | Rejected — HLS-only demo, and `LOW-LAT` would be a lie |
| Static SPA + mocked API (GH/CF Pages) | n/a (faked) | $0 | ~250 lines of MSW handlers mirroring the contract, kept in sync forever | Rejected — a parallel implementation to maintain, and it fakes the product |
| Ephemeral per-visitor instance | yes | high | orchestrator service | Rejected — real infrastructure for a demo |
| Read-only demo mode in the app | n/a | — | contract + api + web + 30 locale files | Rejected — removes the config editor, the thing worth showing |

The rejected rows are not close calls: the static-mock option trades a monthly coffee for
permanent drift risk against `packages/contract`, and read-only mode spends app code to
make the demo *worse*.

## 4. Recommended architecture

One €4-ish ARM VPS (Hetzner CAX11 — 2 vCPU Ampere / 4 GB / 40 GB / 20 TB traffic, or any
equivalent), running the **published Docker Hub image** next to MediaMTX, behind Caddy.

```
                    demo.<domain>:443 ──▶ Caddy ──▶ connect:3000   (SPA + oRPC + /media)
browser ────────────  mtx.<domain>:8888 ──▶ Caddy ──▶ mediamtx:8888 (HLS, TLS terminated)
                      mtx.<domain>:8889 ──▶ Caddy ──▶ mediamtx:8889 (WHEP signalling)
                      mtx.<domain>:8189/udp ─────────▶ mediamtx      (ICE, direct — no proxy)
                      mtx.<domain>:8189/tcp ─────────▶ mediamtx      (ICE-TCP fallback)
```

Containers: `caddy`, `mediamtx` (`-ffmpeg` variant), `mediamtx-connect`,
`demo-publisher`, `watchtower`. Two DNS A records, both pointing at the one host.

### Why the ports line up without touching app code

`REMOTE_MEDIAMTX_URL=https://mtx.<domain>` (no port) joins with MediaMTX's self-reported
`hlsAddress: :8888` / `webrtcAddress: :8889` to produce
`https://mtx.<domain>:8888/front-door/index.m3u8`. Caddy will provision a certificate for
`mtx.<domain>` and serve TLS on any port you declare, so `https://mtx.<domain>:8888` is a
one-line site block. Nothing in `apps/` needs to learn about proxies.

### Configs

`deploy/demo/docker-compose.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    network_mode: host          # simplest way to own :80, :443, :8888, :8889
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data

  mediamtx:
    image: bluenviron/mediamtx:1.19.3-ffmpeg
    restart: unless-stopped
    volumes:
      - ./mediamtx.demo.yml:/mediamtx.yml:ro   # :ro is load-bearing — see §5
      - recordings:/recordings
    networks: [demo]
    ports:
      - '127.0.0.1:8888:8888'   # HLS — only Caddy reaches it
      - '127.0.0.1:8889:8889'   # WHEP signalling — only Caddy reaches it
      - '8189:8189/udp'         # ICE, public
      - '8189:8189/tcp'         # ICE-TCP fallback, public
      # RTSP/RTMP/SRT/API deliberately NOT published

  mediamtx-connect:
    image: bcanfield/mediamtx-connect:latest
    restart: unless-stopped
    depends_on: [mediamtx]
    networks: [demo]
    ports: ['127.0.0.1:3000:3000']
    tmpfs: ['/data']            # config store is RAM-only → `restart` is a full reset
    environment:
      BACKEND_SERVER_MEDIAMTX_URL: http://mediamtx
      MEDIAMTX_API_PORT: '9997'
      REMOTE_MEDIAMTX_URL: https://mtx.${DEMO_DOMAIN}
      MEDIAMTX_RECORDINGS_DIR: /recordings
      MEDIAMTX_SCREENSHOTS_DIR: /screenshots
    volumes:
      - recordings:/recordings:ro
      - screenshots:/screenshots

  demo-publisher:
    build: { context: ../../demo, dockerfile: Dockerfile.publisher }
    restart: unless-stopped
    depends_on: [mediamtx]
    networks: [demo]
    environment:
      DEMO_RTSP: rtsp://mediamtx:8554

  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    command: --cleanup --interval 21600 mediamtx-connect
    volumes: ['/var/run/docker.sock:/var/run/docker.sock']

networks:
  demo:
    internal: true              # containers have no outbound internet — see §7
volumes: { recordings: {}, screenshots: {}, caddy-data: {} }
```

`deploy/demo/Caddyfile`:

```
demo.{$DEMO_DOMAIN} {
	reverse_proxy 127.0.0.1:3000
}

# Serving mtx on 443 too keeps cert issuance boring and gives the bare host a landing.
mtx.{$DEMO_DOMAIN} {
	redir https://demo.{$DEMO_DOMAIN}{uri}
}

https://mtx.{$DEMO_DOMAIN}:8888 {
	reverse_proxy 127.0.0.1:8888
}

https://mtx.{$DEMO_DOMAIN}:8889 {
	reverse_proxy 127.0.0.1:8889
}
```

`deploy/demo/mediamtx.demo.yml` — a copy of `mediamtx.dev.yml` (the already-maintained
fixture fleet) with four deltas:

```yaml
webrtcIPsFromInterfaces: false          # the docker bridge IP is useless to a browser
webrtcAdditionalHosts: ['<public-ipv4>']
webrtcLocalTCPAddress: :8189            # ICE-TCP for viewers on UDP-blocked networks
hlsAllowOrigins: ['*']                  # the page is on demo.<domain>, HLS on mtx.<domain>
webrtcAllowOrigins: ['*']

pathDefaults:
  record: yes
  recordPath: /recordings/%path/%Y-%m-%d_%H-%M-%S
  recordSegmentDuration: 10m
  recordDeleteAfter: 36h                # see the disk arithmetic in §6
```

Keep `loading-dock`'s `record: no` override from the dev config — the mix of inherited
and overridden record state is precisely what the card indicator exists to show.

### Where the video comes from

`demo/gen-clips.sh` already generates CCTV-shaped H.264 clips, and
`demo/publish-streams.sh` already loops them into MediaMTX with `-c copy`. Reuse both:

- `demo/Dockerfile.publisher` (~8 lines): `FROM alpine`, `apk add ffmpeg bash`, run
  `gen-clips.sh` at **build** time, `CMD ["./publish-streams.sh"]`.
- One edit to `publish-streams.sh`: `RTSP_BASE="${DEMO_RTSP:-rtsp://127.0.0.1:8555}"`
  instead of the hardcoded URL, so the capture harness and the demo share one script.

`-c copy` means the publisher transcodes nothing at runtime — CPU is effectively idle,
which is what makes a 2-vCPU box enough. Keep two or three `runOnDemand` lavfi paths from
`mediamtx.dev.yml` (`parking-lot` for HEVC, `loading-dock` for M-JPEG) so the codec chips
and the on-demand lifecycle are represented; they cost nothing while nobody is watching.

The alternative — drop the publisher container and let MediaMTX's `runOnInit` generate
everything from `lavfi`, exactly as `mediamtx.dev.yml` does today — is genuinely
zero-new-files, but it burns ~0.3–0.5 cores per always-on stream and it puts SMPTE bars on
the front page. For a demo whose job is to look like cameras, the 8-line Dockerfile earns
its keep.

## 5. State and reset

| State | Where | Reset by |
|---|---|---|
| App config (`config.json`) | `/data`, **tmpfs** | any container restart; re-seeded from env on boot (`config-store.ts`) |
| MediaMTX config edits | runtime only — MediaMTX never writes `mediamtx.yml`, which is mounted `:ro` | container restart |
| Recordings + thumbnails | named volumes | `recordDeleteAfter: 36h`, self-trimming |

So the entire reset is:

```
0 * * * *  docker compose -f /srv/demo/docker-compose.yml restart mediamtx mediamtx-connect
```

One cron line. No reset endpoint, no seeding script, no app code. Recordings deliberately
survive the restart so the Recordings page always has a Today/Yesterday spread instead of
being empty for the first 20 minutes of every hour.

Hourly is the trade: a visitor who breaks the config (disables HLS, points the app at a
bogus MediaMTX URL) breaks it for everyone for at most an hour. Tighten to 30m if that
turns out to happen; loosen if nobody breaks it.

## 6. Cost

| Item | ~Monthly |
|---|---|
| Hetzner CAX11 (2 vCPU / 4 GB / 40 GB / 20 TB) incl. IPv4 | €4.4 |
| Domain (`.dev`/`.app` at registrar cost) | ~$1 |
| DNS (Cloudflare, DNS-only — do **not** proxy the media hostname) | $0 |
| **Total** | **~$6** |

Prices are from memory and should be re-checked at purchase time. A free variant exists:
Oracle Cloud Always Free ARM runs the identical compose file for $0, at the cost of
account friction and reclamation risk. If a domain isn't worth buying, `sslip.io`
(`demo.203-0-113-10.sslip.io`) gives Caddy a certifiable hostname for free — ugly, but
functional.

**Egress**: three clips at ~300 kbps ≈ 135 MB per viewer-hour, so the 20 TB allowance is
~150,000 viewer-hours. Not a constraint.

**Disk**: 3 recording streams × 300 kbps × 36 h ≈ 4.5 GB steady-state, well inside 40 GB.
Both numbers scale linearly with the clip bitrate set in `gen-clips.sh` — that's the knob
if either gets uncomfortable.

## 7. Security posture

The honest framing: **the demo container is fully readable by any visitor, by design.**

The app config form lets a visitor set `recordingsDirectory` to any path, and
`/media/recordings/:streamName/:file` will then serve `<that path>/<a>/<b>`. Path
traversal *out of* the configured base is blocked (`safeJoin` in `apps/api/src/media.ts`),
but the base itself is user-settable — that is correct behavior for a single-tenant admin
UI and unacceptable for an anonymous one. Rather than change the app, contain the blast:

- **Nothing sensitive in the container.** No API tokens, no registry credentials, no SSH
  keys mounted. The env vars are the five public ones above.
- **`internal: true` on the docker network.** The app has no legitimate outbound internet
  need, and this turns the "visitor points `mediaMtxUrl` at an arbitrary host" SSRF into a
  connection error. Watchtower and Caddy sit outside that network.
- **Only 80/443/8888/8889/8189 published.** MediaMTX's API, RTSP, RTMP, and SRT ports stay
  on the docker network; nobody can publish a stream into the demo.
- **Hourly restart** bounds the lifetime of anything a visitor changes.
- Cloudflare (DNS-only for `mtx`, proxied is fine for `demo`) or the provider's firewall
  in front, if abuse ever shows up. Not needed on day one.

Treat the box as disposable: if it is ever compromised, `docker compose down -v` and
re-run the two-command bootstrap.

## 8. Keeping it current

Watchtower polls Docker Hub every 6 h and recreates `mediamtx-connect` when a new
`:latest` is published by the existing release pipeline. That is one container instead of
a deploy workflow, an SSH key in GitHub secrets, and a job to keep green. A recreate also
happens to be a reset, so releases and resets share a mechanism.

If we later want deploy-on-release determinism, add a `release: published` workflow that
SSHes in and runs `docker compose pull && up -d` — but not before Watchtower proves
insufficient.

## 9. What this costs the repo

Added:

```
deploy/demo/docker-compose.yml
deploy/demo/Caddyfile
deploy/demo/mediamtx.demo.yml
deploy/demo/.env.example
deploy/demo/README.md          ← bootstrap + runbook
demo/Dockerfile.publisher      ← ~8 lines
docs/HOSTED-DEMO.md            ← this file
```

Changed: one line in `demo/publish-streams.sh` (env-parameterized RTSP base).

**Zero files under `apps/` or `packages/`.** No contract change, no new oRPC procedure, no
new env var, no new i18n key. `docs/FEATURES.md` is untouched because nothing about the
product changes — the demo is deployment, not a feature.

### The one non-obvious cost: the README link

Adding "🔴 **[Live demo](https://demo.…)**" to `README.md` shifts its `sourceHash` and
trips `pnpm i18n:check`, which requires all 30 `docs/i18n/README.*.md` to carry the change
and have their hashes bumped (`docs/I18N.md` § "When the source README.md changes").
Budget that as its own commit, and batch it with any other README edit that's pending —
don't spend the 30-file churn twice.

### Deliberately not in v1

- **In-app "this is a public demo, it resets hourly" banner.** Real cost: a runtime flag
  from the API (contract + handler + client) plus a string in 30 locale files, and it
  ships demo-only code to every self-hoster. Put the notice in the README link text and
  `deploy/demo/README.md` instead. Revisit only if visitors are visibly confused.
- **Read-only mode.** See §3.

Both of those are rejected *as demo-only code*. They stop being demo-only once a second
audience wants them — a team or household hosting Connect for members who should watch
but not edit. [`docs/ideas/06-access-tiers.md`](./ideas/06-access-tiers.md) works that
through: the banner becomes free (operator-supplied text needs no translation), read-only
becomes a product feature with its own users, and "restore baseline" replaces the hourly
cron in §5 with something that doesn't drop viewers. **This plan still ships first** —
it's infrastructure only and doesn't wait on any of that.
- **A "try it locally" Codespaces/devcontainer button.** Complementary and nearly free
  (one `devcontainer.json` running the existing `docker compose up`), but it needs a
  GitHub account and forwarded-port WebRTC won't work. Worth its own small proposal.

## 10. Rollout checklist

1. Buy domain, create `demo` + `mtx` A records at the VPS IP.
2. Provision the VPS; `apt install docker.io docker-compose-v2`; enable
   `unattended-upgrades`; firewall down to 22, 80, 443, 8888/tcp, 8889/tcp, 8189/tcp+udp.
3. Clone the repo to `/srv/demo`, write `.env` with `DEMO_DOMAIN` and the public IPv4,
   substitute the IP into `webrtcAdditionalHosts`.
4. `docker compose up -d`; confirm Caddy issued certs for both hostnames on all three
   ports.
5. Verify, in a browser on another network: grid populates · a card plays and its pill
   reads **WEBRTC** (not HLS — if it reads HLS, constraint (c) is wrong somewhere) ·
   `LOW-LAT` mode works · snapshots appear on idle cards · Recordings shows Today with
   thumbnails · an MP4 plays inline and downloads · a config save round-trips · an hourly
   restart reverts it.
6. Add the cron line; watch one reset cycle.
7. Only then: the README commit, with all 30 translations re-synced.
