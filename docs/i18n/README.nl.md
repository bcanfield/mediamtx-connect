<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>De webinterface voor <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Bekijk livestreams, blader door opnames, bewerk elke configuratiesleutel — vanuit je browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — raster met livestreams, opnamebrowser en configuratie-editor" width="860">

<details>
<summary>🌍 Lees dit in 30 talen</summary>
<p>
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <a href="./README.fr.md">Français</a> •
  🇵🇹 <a href="./README.pt.md">Português</a> •
  🇯🇵 <a href="./README.ja.md">日本語</a> •
  🇵🇱 <a href="./README.pl.md">Polski</a> •
  🇰🇷 <a href="./README.ko.md">한국어</a> •
  🇹🇷 <a href="./README.tr.md">Türkçe</a> •
  🇳🇱 <strong>Nederlands</strong> •
  🇨🇿 <a href="./README.cs.md">Čeština</a> •
  🇹🇼 <a href="./README.zh-tw.md">繁體中文</a> •
  🇧🇷 <a href="./README.pt-br.md">Português (BR)</a> •
  🇮🇩 <a href="./README.id.md">Bahasa Indonesia</a> •
  🇷🇴 <a href="./README.ro.md">Română</a> •
  🇸🇪 <a href="./README.sv.md">Svenska</a> •
  🇩🇰 <a href="./README.da.md">Dansk</a> •
  🇳🇴 <a href="./README.no.md">Norsk</a> •
  🇫🇮 <a href="./README.fi.md">Suomi</a> •
  🇬🇷 <a href="./README.el.md">Ελληνικά</a> •
  🇭🇺 <a href="./README.hu.md">Magyar</a> •
  🇺🇦 <a href="./README.uk.md">Українська</a> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## Wat het is

MediaMTX is een uitstekende streamingserver zonder interface. Connect is de ontbrekende front-end: één container die met de MediaMTX-API praat en die omtovert tot een cameramuur, een opnamearchief en een configuratie-editor.

Het is een metgezel, geen vervanger. Elk scherm leunt op iets dat MediaMTX al blootlegt: een path, een API-endpoint, een `runOn*`-hook, een protocol dat het van huis uit serveert. Geen video bewaard, geen media geproxyd, geen database.

## Snel starten

Multi-arch images (`linux/amd64`, `linux/arm64`) — Docker haalt de juiste op.

**Draait MediaMTX al?** Zet Connect ernaast:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Begin je bij nul?** De meegeleverde compose start beide:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Open daarna <http://localhost:3000>.

> [!IMPORTANT]
> Connect heeft `api: yes` nodig in je `mediamtx.yml`. De [meegeleverde configuratie](../../mediamtx.yml) werkt meteen.

## Wat je krijgt

### Liveweergave

Elk path dat MediaMTX kent, in een raster van 2 tot 4 kolommen.

- **WebRTC of HLS, per kaart.** `AUTO` valt stilletjes terug op HLS, `LOW-LAT` staat op WebRTC, `COMPAT` dwingt HLS af — en elke kaart meldt het transport dat hij echt kreeg.
- **Snapshots bij stilstand.** Een achtergrondtaak houdt op elke kaart een recent beeld bij, met de leeftijd ervan op het label.
- **Live telemetrie.** Codecs, aantal kijkers en uptime, rechtstreeks uit de path-lijst.
- **Eerlijke opnamestatus.** Kaarten tonen of een stream *daadwerkelijk* opneemt; een status die Connect niet kon lezen heet onbekend, nooit uit.
- **Publicatie-URL's op het klembord.** RTSP, RTMP en SRT, gebouwd uit de eigen luisteradressen van de server.

### Opnames

- De MP4's van elke stream, per dag gegroepeerd, met automatische thumbnails.
- Een speler die ter plekke uitklapt, doorzoekbaar via HTTP Range-requests.
- Downloads die streamen, met live voortgang en annuleren.
- Druk op `/` om te filteren.

### Configureren zonder YAML

- **De volledige serverconfiguratie** — 65 getypeerde, gevalideerde besturingselementen over Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC en SRT.
- **Path defaults en overrides per path**, op de scopes waar MediaMTX ze vandaan serveert. Een stream onder een wildcard opslaan schrijft een spaarzame entry, zodat onaangeroerde sleutels blijven erven.
- **Alle 15 `runOn*`-hooks**, met een waarschuwing waar opslaan het path herstart.
- **Spaarzame writes** — alleen de sleutels die je wijzigde.

### Beheer

Eén proces voor API, SPA en media · multi-arch · `GET /health` · gestructureerde logs · PWA · licht en donker · 30 talen · geen database.

## Omgevingsvariabelen

Ze vullen alleen de eerste start. Daarna blijft alles aanpasbaar onder **Config**.

| Variabele | Standaard | Waarvoor |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Waar Connect de MediaMTX-API bereikt vanuit binnen zijn container |
| `MEDIAMTX_API_PORT` | `9997` | Poort van de MediaMTX-API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Hostpad dat voor opnames wordt gemount (alleen compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Waar thumbnails terechtkomen |

`http://mediamtx` lost alleen op binnen het netwerk van de meegeleverde compose — voor een losse `docker run` wijs je hem naar je eigen host.

## Hoe het werkt

```
Browser ──HLS / WebRTC (WHEP)──────────────────────────┐
   │                                                   │
   │ oRPC (typed)                                      ▼
   ▼                                              ┌──────────┐
┌─────────────────────┐    MediaMTX HTTP API      │ MediaMTX │
│ mediamtx-connect    │ ────────────────────────▶ │  server  │
│ Hono API + React SPA│                           └──────────┘
└─────────────────────┘                                │
   │ reads                                             │ writes
   ▼                                                   ▼
recordings/ + screenshots/  ◀────────────────────  MP4 segments
```

Afspelen gaat van browser naar MediaMTX. Connect verplaatst alleen JSON, plus de opnames en thumbnails die het van schijf leest.

## Documentatie

| | |
|---|---|
| [Functies](../FEATURES.md) | Elke opgeleverde mogelijkheid, route en procedure |
| [Architectuur](../../ARCHITECTURE.md) | Hoe de onderdelen in elkaar passen |
| [Bijdragen](../../CONTRIBUTING.md) | Dev-setup, scripts, PR-proces |
| [Voorbeelden](../../examples/) | Raspberry Pi-camera, neppe streams om te testen |

## Bijdragen

Issues en PR's zijn welkom. `pnpm install && pnpm dev` geeft je de volledige stack met testdata — zie [CONTRIBUTING.md](../../CONTRIBUTING.md), en let op: PR-titels zijn conventional commits. We volgen een [Gedragscode](../../CODE_OF_CONDUCT.md).

## Licentie

[MIT](../../LICENSE)
