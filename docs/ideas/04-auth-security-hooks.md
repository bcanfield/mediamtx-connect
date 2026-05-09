# Ideas: Auth, Security & Hooks

MediaMTX Connect today is a single-tenant editor over the global MediaMTX config — no app-level login, no opinionated UI for `authMethod`, IP allowlists, TLS material, or the dozen `runOn*` lifecycle hooks. The surface area is large: three auth backends (`internal`, `http`, `jwt`), six TLS-capable protocols (RTSP/RTMP/HLS/WebRTC/API/Metrics), per-path ACLs that combine user + IP + action + path-regex, and roughly fifteen lifecycle hooks per path plus two server-level ones. Everything below treats Connect as the operator console that turns those primitives into safe, discoverable, testable workflows — and as a first-class webhook receiver for the hooks themselves.

## Auth method picker & onboarding

- **Auth method wizard** — three-card chooser (`internal` / `http` / `jwt`) that explains tradeoffs, then drops into a sub-wizard. Writes `authMethod` and the matching `auth*` keys atomically. Backed by a "you can change this later" reassurance.
- **Auth health banner** — sticky banner on every page when `authMethod: internal` is active *and* `authInternalUsers` contains the default `any:any` rule, prompting an upgrade. Detects via the `authInternalUsers` array.
- **First-run hardening checklist** — once-per-install screen: "set an admin user, disable anonymous publish, enable TLS for at least one protocol, restrict `pprof`." Each item links to the relevant `auth*`/`*Encryption` setting.
- **Auth method diff preview** — before saving an `authMethod` switch, show a diff of which paths/users will lose access and which actions become anonymous. Reads current `authInternalUsers` vs. proposed JWT/HTTP config.
- **Migration helper: internal -> JWT** — exports `authInternalUsers` to a CSV/JSON shape that can be loaded into Keycloak/Auth0 as the `mediamtx_permissions` claim payload (`authJWTClaimKey`).

## Internal users & permissions table

- **Users CRUD grid** — table over `authInternalUsers` with inline edit for `user`, `pass`, `ips`, `permissions[]`. Submit goes through a single PATCH on the global config.
- **Per-row password strength meter** — zxcvbn-style indicator next to the `pass` field; warns when storing plaintext and offers to convert to `sha256:` or `argon2:` hash format.
- **Hash-on-paste** — paste a plain password, choose `sha256:` or `argon2:`, save the hash. Avoids ever persisting plaintext in the config file.
- **Action multi-select chips** — `publish` / `read` / `playback` / `api` / `metrics` / `pprof` rendered as togglable chips on each `permissions[]` row, with tooltips that explain each action.
- **Path matcher tester** — input a candidate stream name; show which user rows would match given their `path` regex/glob in `permissions[]`. Catches "I thought `cam_*` covered `cameras_front`" mistakes.
- **IP allowlist field with CIDR validation** — typed `ips[]` editor that validates each entry, autocompletes "my current IP", and renders a small map for public IPs.
- **Per-row test button** — synthetically authenticates as that user against the running MediaMTX (basic-auth probe to `/v3/paths/list` or RTSP DESCRIBE) and shows pass/fail.
- **Bulk import users** — CSV/JSON paste, dry-run validation, then commit. Validates uniqueness on `user` and well-formedness of `permissions[]`.
- **User clone** — duplicate a row, useful for "give the new operator the same access as Alice."
- **Disable-without-delete toggle** — soft-disable a user (Connect prepends `#disabled-` or moves them to a Connect-managed "parked" list) so audit trails stay intact.

## Per-path ACL editor

- **Path-centric permissions view** — pivot the same data, but grouped by path: "who can `publish` to `cam/front`?" Rolls up entries from `authInternalUsers[].permissions[]`.
- **Drag-to-grant** — drag a user chip onto a path row to add a permission; modal asks which `action`s. Writes back to `authInternalUsers`.
- **Anonymous-publish badge** — red badge on any path that resolves to `publish` with no `user`/`pass` constraint. Surfaces the `all` / `any` wildcard pitfall.
- **Effective permissions resolver** — given user X and path Y, show the matched rule and why (which entry in `authInternalUsers`, which `ips` line, which `action`). Like an IAM policy simulator.
- **Path lock** — Connect-side "read-only path" flag stored in its own DB; the UI refuses edits to the corresponding `paths.<name>` entry even for admins, guarding against accidental config drift.

## JWT / OIDC wizard

- **Provider presets** — Keycloak, Auth0, Okta, Google, Azure AD, AWS Cognito. Each preset prefills `authJWTJWKS`, `authJWTIssuer`, `authJWTAudience`, and shows the exact claim shape needed under `authJWTClaimKey`.
- **JWKS reachability check** — fetches `authJWTJWKS` from the Connect server, parses keys, displays `kid`/`alg` table. Catches firewall and TLS issues.
- **Token decoder & dry-run** — paste a JWT, validate signature against `authJWTJWKS`, show whether `iss`/`aud` match `authJWTIssuer`/`authJWTAudience`, and whether the `authJWTClaimKey` payload would grant access to a chosen path/action.
- **Self-signed JWKS hint** — explains `authJWTJWKSFingerprint` and offers to extract the fingerprint from the live cert with one click.
- **Claim-shape generator** — given a target user "publisher of `cam/*`", emit the JSON to drop into the IdP's user metadata under `mediamtx_permissions`.
- **`authJWTExclude` builder** — UI to mark `api`, `metrics`, `pprof` as exempt from JWT, e.g. for Prometheus scraping. Mirrors `authHTTPExclude`.
- **JWKS refresh button** — in-UI "force refetch" that calls the server's JWKS refresh path (or restarts the relevant subsystem) when keys rotate.

## External HTTP auth tester

- **Webhook sandbox** — given an `authHTTPAddress`, send a synthetic request matching MediaMTX's payload (action, path, user, ip, query) and render the response. Pure reachability + contract test.
- **`authHTTPExclude` editor** — visual list of `[action]` entries excluded from HTTP auth, with tooltips for `api`/`metrics`/`pprof` so operators don't lock themselves out of Prometheus.
- **Mock-server scaffolding** — generate a tiny Express/FastAPI/Go stub for `authHTTPAddress` that an operator can deploy as a starting point.
- **Latency probe** — periodically pings `authHTTPAddress` and graphs p50/p95; warns when response time approaches `readTimeout`.
- **Self-signed cert hint** — input for `authHTTPFingerprint` with an "extract from URL" helper that reads the cert and computes the fingerprint.

## App-level auth on the Connect UI itself

- **Connect login** — wrap the Next.js app in Auth.js (Credentials + GitHub + Google providers). Today the app is single-user; this turns it into a multi-operator console. New table `connect_users` in the local store.
- **Clerk integration option** — alternative flow for teams who already pay for Clerk; gated behind an env var.
- **OIDC SSO with the same IdP as MediaMTX** — if the operator picked Keycloak for `authMethod: jwt`, offer to reuse it for the Connect UI. Saves a second IdP.
- **2FA on the Connect UI** — TOTP enrollment for any Connect user with admin role. Independent of MediaMTX's own auth.
- **Magic-link login** — passwordless option for low-friction shared admin accounts.
- **Session list & kick (Connect)** — a "logged-in operators" panel inside Connect itself (separate from MediaMTX's RTSP/RTMP sessions) so admins can revoke a colleague's browser session.
- **API token management** — generate scoped Connect API tokens (e.g. read-only metrics, recording downloads) for external automation. Stored hashed in the Connect DB.
- **Brute-force lockout** — N failed Connect logins in M minutes triggers a temporary IP block, surfaced on a dashboard.

## Role-based UI access

- **Roles: admin / operator / viewer** — admin edits global config, operator manages paths and recordings, viewer is read-only with live preview. Separate from MediaMTX permission actions.
- **Per-page route guard** — the `/config/mediamtx/global` editor is admin-only; live streams are open to viewers; recordings are operator+.
- **"Acting as" mode** — admin can temporarily downgrade their own session to operator/viewer to verify the role's UX.
- **Path ownership** — assign paths to Connect users (`owner_user_id`); only owners and admins can edit hooks/recording for that path.

## Audit log

- **Local audit table** — every config change, kick, recording delete, user add — stored in SQLite/Prisma with `who`, `when`, `what`, before/after JSON diff.
- **Diff viewer** — open any audit row to see a colored YAML diff of the affected `paths.<name>` or root config block.
- **Audit export** — CSV/JSON download for compliance teams; filter by user, action, date range.
- **Tamper-evidence** — append-only with hash-chained rows; UI shows a "verified" badge if the chain is intact.
- **Auth-change alerts** — bold the audit row when `authMethod`, `authInternalUsers`, or any `*Encryption` field changed.

## Failed-login & connection dashboards

- **Failed-login feed** — backed by a Connect-hosted `runOnConnect` webhook receiver that logs rejections; chart of failures per minute, top offending IPs.
- **Per-user login history** — last N successful and failed logins for each `authInternalUsers` entry. Powered by `runOnConnect` + `runOnDisconnect`.
- **Geo-IP enrichment** — annotate each failed login with country/ASN; flag logins from new countries for an account.
- **Auto-blocklist** — N failures from one IP in M minutes adds the IP to a Connect-managed `ips: ['!1.2.3.4']` deny entry across all `authInternalUsers`.
- **Kick-and-ban UI** — kick a live session via the MediaMTX API and add the offending IP to the temporary blocklist in one button. Uses the kick endpoint plus `authInternalUsers[].ips`.

## TLS cert manager

- **Cert upload UI** — paste or upload PEM for `rtspServerCert`/`rtspServerKey`, `rtmpServerCert`/`rtmpServerKey`, `hlsServerCert`/`hlsServerKey`, `webrtcServerCert`/`webrtcServerKey`, `apiServerCert`/`apiServerKey`, `metricsServerCert`/`metricsServerKey`, `playbackServerCert`/`playbackServerKey`, `pprofServerCert`/`pprofServerKey`. Stores them under a managed path and writes the path into the config.
- **One cert, many protocols** — checkbox grid: pick a single uploaded cert, tick which `*ServerCert`/`*ServerKey` slots to wire it into. Solves the "same cert across RTSPS+RTMPS+HLSS" pattern.
- **Expiration dashboard** — table of all configured `*ServerCert` files with NotAfter, days remaining, color-coded. Pulls expiry from the actual file on disk.
- **TLS rotation reminder** — Connect emails / Slacks the admin N days before any cert in the dashboard expires.
- **Let's Encrypt helper** — wire ACME (Certbot or lego) and auto-renew the configured `*ServerCert` files; trigger MediaMTX hot reload on rotation.
- **Self-signed generator** — for dev: one-click generate a self-signed cert, write into `*ServerKey`/`*ServerCert`, capture the SHA-256 for `sourceFingerprint` on consuming paths.
- **CA chain validator** — checks that uploaded `*ServerCert` includes the full chain; warns if intermediates are missing (common cause of WebRTC handshake failures).

## Encryption presets & posture

- **"TLS everywhere" preset** — one-click flip of `rtspEncryption: strict`, `rtmpEncryption: strict`, `hlsEncryption: yes`, `webrtcEncryption: yes`, `srtEncryption`, `apiEncryption: yes`, `metricsEncryption: yes`, `playbackEncryption: yes`, `pprofEncryption: yes`. Requires certs already configured.
- **Encryption matrix view** — table with rows = protocol, columns = `Encryption / ServerCert / ServerKey / Address`; each cell is a status pill (green/yellow/red).
- **Stream encryption badges** — on the live streams page, each stream gets a green-shield/red-shield based on whether it's served over the secure variant (`rtspsAddress`, `rtmpsAddress`, etc.).
- **Mixed-mode warning** — when `rtspEncryption: optional`, surface a banner explaining the security implications and offer the `strict` upgrade.
- **`rtspAuthMethods` hardener** — warns when `digest` is enabled, links to docs explaining it's compatibility-only and weaker than `basic`-over-TLS.

## IP allowlists & trusted proxies

- **Trusted proxies editor** — single screen that edits `apiTrustedProxies`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `metricsTrustedProxies`, `pprofTrustedProxies`, `playbackTrustedProxies` together. Most operators want them in sync.
- **CIDR input with validation** — autocomplete "RFC1918", "loopback", "current public IP"; rejects malformed entries.
- **Reverse-proxy presets** — Cloudflare, Fastly, AWS ALB, Tailscale: prefill the relevant `*TrustedProxies` ranges.
- **Allowlist-conflict detector** — flags when a user's `authInternalUsers[].ips` excludes ranges that are also in `*TrustedProxies`, which usually indicates a misconfiguration.
- **Anonymous-publish detector** — scans `authInternalUsers` for entries that grant `publish` without IP restrictions and lists the affected paths. Critical for prosumer setups exposed to the open internet.

## Hooks UI

- **Per-path hooks panel** — accordion editor for `runOnInit`, `runOnDemand`, `runOnUnDemand`, `runOnReady`, `runOnNotReady`, `runOnRead`, `runOnUnread`, `runOnRecordSegmentCreate`, `runOnRecordSegmentComplete` with companion fields `*Restart`, `*StartTimeout`, `*CloseAfter`.
- **Server-level hooks panel** — sibling editor for `runOnConnect`, `runOnConnectRestart`, `runOnDisconnect`. Distinguishes them visually from path-level hooks since they're scoped differently.
- **Env var inserter** — autocomplete for `MTX_PATH`, `MTX_QUERY`, `MTX_READER_TYPE`, `MTX_READER_ID`, `MTX_CONN_TYPE`, `MTX_CONN_ID`, `MTX_SOURCE_TYPE`, `MTX_SOURCE_ID`, `RTSP_PORT`, plus regex-group `G1`/`G2`. Inserts the right `$VAR` placeholder.
- **Inline command tester** — run the configured `runOn*` command in a Connect-side sandbox with mocked env vars and capture stdout/stderr/exit code. Catches PATH/quoting bugs before they fire on a live stream.
- **Hook syntax linter** — flags common pitfalls: using `&` (background) without `Restart`, missing quoting around `$MTX_PATH`, overlong commands that will be truncated.
- **Timeout sanity** — when `runOnDemandStartTimeout` < the typical `runOnDemand` warmup time observed, warn. Same for `runOnDemandCloseAfter` set shorter than typical reader gaps.
- **Restart toggle visualizer** — show which hooks have `*Restart: true` and explain "this command runs forever" semantics vs one-shot.
- **Hook execution graph** — animated state diagram per path: `init -> demand -> ready -> read -> unread -> notReady -> unDemand`, with the configured commands bound to each transition.

## Hook command catalog

- **Templated drop-ins** — gallery of paste-ready commands: "POST to Discord on publish" for `runOnReady`, "log to syslog" for `runOnConnect`, "ffmpeg transcode-on-demand" for `runOnDemand`, "rclone copy on segment complete" for `runOnRecordSegmentComplete`.
- **Recipe: pull-from-RTSP fallback** — wires `runOnDemand` with an `ffmpeg` command that publishes from a fallback URL when the primary publisher disappears.
- **Recipe: motion-triggered recording** — `runOnRead` starts a temp recording; `runOnUnread` stops it.
- **Recipe: archive segments to S3** — `runOnRecordSegmentComplete` runs `aws s3 cp $MTX_PATH ...` and optionally deletes locally on success.
- **Recipe: thumbnail generator** — `runOnReady` spawns `ffmpeg -i ... -vframes 1 thumb.jpg` and stores it in Connect's static dir for the live page to display.
- **Recipe: stream uptime ping** — `runOnReady` pings a healthchecks.io URL; `runOnNotReady` reports failure.
- **Recipe: prometheus pushgateway counter** — `runOnConnect` increments a counter for grafana.

## Hook output capture & built-in receivers

- **Hook log viewer** — Connect captures stdout/stderr of recent `runOn*` invocations (per path, last N) and renders a tail-style log. Requires Connect to be the wrapper or to receive output via a sidecar.
- **Connect as webhook target** — Connect exposes `/api/webhooks/runon/:event/:path` so users can set `runOnReady: curl -X POST http://connect/api/webhooks/runon/ready/$MTX_PATH`. Connect persists every event into an event log table, no shell scripts required.
- **Webhook signing** — Connect issues a per-install secret; the catalog snippet includes an HMAC header so Connect can verify the call.
- **Event timeline** — chronological view per path: connect / publish / ready / read / unread / not-ready / disconnect, color-coded with durations.
- **Hook replay** — re-invoke a captured hook event with one click, useful for debugging downstream automation (Discord webhook, S3 upload).

## Notifications & alerting

- **Discord/Slack/Teams targets** — configure once in Connect, reference by name in a hook template (e.g. `runOnNotReady -> notify('ops-alerts', 'cam/front offline')`).
- **Alert rules engine** — UI like "when path X has been `notReady` for >N seconds, page on-call." Backed internally by Connect's hook receiver, not by extra `runOn*` shell.
- **Quiet hours** — suppress alerts during defined windows; useful for known maintenance.
- **Escalation** — if a `runOnNotReady` event isn't followed by `runOnReady` within N minutes, escalate to a second channel.
- **Digest mode** — instead of one ping per `runOnConnect`, a 15-minute digest with counts.

## Compliance & posture presets

- **GDPR preset** — disables `pprof` listener and `apiTrustedProxies: []`, forces `recordDeleteAfter` to a configurable retention, requires `authMethod` ≠ `internal` with `any:any`, enables audit log.
- **HIPAA-leaning preset** — forces TLS on every protocol, requires `authMethod: jwt` or `http`, enables audit log, disables anonymous publish.
- **NDAA / camera-list preset** — flags any `paths.<name>.source` URL pointing at known disallowed vendors.
- **Posture score** — single 0-100 number computed from auth strength, TLS coverage, allowlist tightness, hook hygiene; explained on hover.
- **Posture history** — line chart of the score over time so managers can see hardening progress.

## Secret management

- **Secret references in hooks** — instead of inlining a Discord webhook URL into `runOnReady`, store it in Connect's secret store and reference as `${secrets.discord_ops}`. Connect resolves at write-time so MediaMTX's config still works.
- **HashiCorp Vault integration** — pull `auth*` passwords and TLS keys from Vault on Connect startup; no plaintext in the YAML.
- **1Password / Doppler / AWS Secrets Manager** — same pattern, alternate backends.
- **Sensitive-field masking** — UI never renders `pass`, `*ServerKey`, `whepBearerToken` in plaintext; copy-to-clipboard requires explicit reveal and is audit-logged.

## Sessions & live administration

- **Session inspector** — live table of MediaMTX sessions (per protocol) with `kick` button. Calls the MediaMTX API kick endpoints.
- **Bulk kick** — filter by path/user/IP, kick all matching sessions in one action. Useful when rotating credentials.
- **Kick + revoke** — kick a session and disable the matching `authInternalUsers` row in one click.
- **Connection-rate guardrail** — Connect watches connect/disconnect rate via `runOnConnect`/`runOnDisconnect` and warns on suspicious bursts.
- **WHEP/WHIP token rotator** — rotate `whepBearerToken` on selected paths and broadcast the new token via Connect's notification channels.

## Source-side security

- **`sourceFingerprint` helper** — when configuring a path with `source: rtsps://...`, Connect can fetch the cert and compute the SHA-256 to drop into `sourceFingerprint`. Avoids the manual openssl dance.
- **Fingerprint drift alert** — periodically re-fetch the source's cert; if the fingerprint changes from `sourceFingerprint`, alert.
- **TLS source health** — column on the streams list showing the source's cert NotAfter for any `rtsps://` / `https://` source.

## Misc / polish

- **Config dry-run with auth** — before writing, simulate auth checks for the existing live sessions and warn if any would be cut off.
- **"Why was I denied?" debugger** — paste a denied client's IP, user, action, path; Connect walks through `authMethod` and renders the exact step that rejected them. Works for `internal`, and (where data is available) for `jwt` and `http`.
- **Read-only docs sidebar** — context-aware docs panel: clicking the `runOnDemand` field opens the relevant MediaMTX docs section without leaving Connect.
- **Config rollback** — every save snapshots the prior YAML; one-click revert. Critical when an `authMethod` change locks people out.
- **"Lockout-safe" save** — when about to save a config that would lock the *current* admin out (e.g. removing their IP from `apiTrustedProxies`), require an explicit "I understand" confirmation.
- **Hook performance budget** — track exec time of `runOn*` commands via Connect's wrapper; flag any whose duration approaches `readTimeout`/`writeTimeout`, since slow hooks can stall the pipeline.
