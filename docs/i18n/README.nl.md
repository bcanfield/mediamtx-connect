<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>De webinterface voor <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Bekijk livestreams, blader door opnames en bewerk je MediaMTX-configuratie vanuit de browser.</p>

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

Het is een metgezel, geen vervanger. Elk scherm komt overeen met iets dat MediaMTX al blootlegt: een path, een API-endpoint, een `runOn*`-hook, een protocol dat het van huis uit serveert. Geen video bewaard, geen media geproxyd, geen database.

## Snel starten

Multi-arch images (`linux/amd64`, `linux/arm64`); Docker haalt de juiste op.

**Draait MediaMTX al?** Zet Connect ernaast:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -e REMOTE_MEDIAMTX_URL=http://<host-your-browser-uses> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  -v mediamtx-connect-screenshots:/screenshots \
  bcanfield/mediamtx-connect:latest
```

**Begin je bij nul?** De meegeleverde compose bouwt Connect en draait het naast MediaMTX:

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

- **WebRTC of HLS, per kaart.** `AUTO` valt stilletjes terug, `LOW-LAT` staat op WebRTC, `COMPAT` dwingt HLS af. Elke kaart meldt het transport dat hij echt kreeg.
- **Snapshots bij stilstand.** Een achtergrondtaak houdt op elke kaart een recent beeld bij, met de leeftijd ervan op het label. Nu meteen een verse nodig? Neem er een via het kaartmenu.
- **Live telemetrie.** Codecs, aantal kijkers en uptime, rechtstreeks uit de path-lijst.
- **Eerlijke opnamestatus.** Kaarten tonen of een stream *daadwerkelijk* opneemt; een status die Connect niet kon lezen heet onbekend, nooit uit.
- **Publicatie-URL's op het klembord.** RTSP, RTMP en SRT, gebouwd uit de eigen luisteradressen van de server. De pagina van elk path gaat verder met een paneel voor publiceren en lezen: elk protocol dat de server aanbiedt, inclusief WHIP, WHEP, HLS en de TLS-varianten, met kant-en-klare fragmenten voor ffmpeg, GStreamer, OBS, ffplay en VLC.

### Opnames

- Een dagtijdlijn per stream uit de afspeelserver van MediaMTX: opgenomen stukken en de gaten ertussen, elk afspeelbaar. Staat afspelen uit, dan somt Connect precies de configuratiewijzigingen op die nodig zijn en past ze met één klik toe.
- Clips downloaden: elk bereik tot een uur (of de laatste 5 min, 15 min of het laatste uur) als één gewone MP4, door MediaMTX over segmenten heen aan elkaar gezet zonder hercodering.
- MP4- of MPEG-TS-segmenten per stream, per dag gegroepeerd, met automatisch gegenereerde thumbnails.
- Een ingebouwde speler die ter plekke uitklapt, doorzoekbaar via HTTP-range-requests.
- Downloads die streamen, met live voortgang en annuleren.
- Druk op `/` om te filteren.

### Sessies

- **Iedereen die verbonden is, in één tabel.** Publishers en lezers via RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC en HLS, met extern adres, bytes in en uit en uptime, elke 5 seconden ververst.
- **Een client eruit gooien**, na een bevestiging. Hij kan opnieuw verbinden; eruit gooien is geen ban.

### Configureren zonder YAML

- **De serverconfiguratie:** 66 getypeerde, gevalideerde besturingselementen over Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC en SRT.
- **Path defaults en overrides per path**, op de scopes waar MediaMTX ze vandaan serveert. Een stream onder een wildcard opslaan schrijft een spaarzame entry, zodat onaangeroerde sleutels de defaults blijven volgen.
- **Een path-catalogus** met live- en regex-badges, een begeleid formulier "RTSP-camera toevoegen", en terugdraaien of verwijderen voor de eigen entry van elk path (met een waarschuwing als er iemand verbonden is).
- **Live gezondheid op de pagina van elk path:** tracks, lezers, verplaatste bytes, frames met fouten en uptime, elke 5 seconden ververst. Een path waarop niets publiceert staat op inactief, niet op kapot.
- **Veerkracht op elk path:** een altijd beschikbare fallback die een offline clip in een lus afspeelt zolang de camera uit is, en pullen op aanvraag dat de bron alleen opent terwijl iemand kijkt.
- **Elke `runOn*`-hook**, met een waarschuwing waar opslaan het path herstart.
- **Doorsturen:** stuur een path naar YouTube, Twitch of een andere server via de eigen `forward`-lijst van MediaMTX, met gemaskeerde streamsleutels en zonder path-herstart.
- **Spaarzame writes.** Alleen de sleutels die je wijzigde worden verstuurd.

### Beheer

Eén proces voor API, SPA en media · multi-arch · `GET /api/health` · MediaMTX-versie in de kop · gestructureerde logs · installeerbaar als PWA · licht en donker · 30 talen · geen database.

## Omgevingsvariabelen

Deze vullen de eerste start. Alles blijft aanpasbaar onder **Config**.

| Variabele | Standaard in de image | Waarvoor |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Waar Connect de MediaMTX-API bereikt |
| `MEDIAMTX_API_PORT` | `9997` | Poort van de MediaMTX-API |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Waar de *browser* MediaMTX bereikt om af te spelen. Stel hem in zodra de browser niet op de server draait |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Waar Connect opnames leest |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Waar snapshots en thumbnails terechtkomen |
| `DATA_DIR` | `/data` | Waar `config.json` staat |
| `PORT` | `3000` | HTTP-poort |
| `LOG_LEVEL` | `info` | Logniveau van Pino |

`http://mediamtx` lost alleen op binnen het netwerk van de meegeleverde compose. Voor een losse `docker run` wijs je hem naar je eigen host. Met compose stel je `REMOTE_MEDIAMTX_HOST` in `.env` in in plaats van `REMOTE_MEDIAMTX_URL`: die bepaalt ook de WebRTC-host die MediaMTX adverteert. [`.env.example`](../../.env.example) legt ze allemaal uit, en `pnpm dev` gebruikt localhost-standaarden zonder enige `.env`.

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

Live afspelen gaat van browser naar MediaMTX. Connect verplaatst JSON, plus de opnames en thumbnails: van schijf, of opgenomen stukken die het via de afspeelserver van MediaMTX proxyt.

## Documentatie

| | |
|---|---|
| [Functies](../../docs/FEATURES.md) | Elke opgeleverde mogelijkheid, route en procedure |
| [Architectuur](../../docs/ARCHITECTURE.md) | Hoe de onderdelen in elkaar passen |
| [Bijdragen](../../CONTRIBUTING.md) | Dev-setup, scripts, PR-proces |
| [Voorbeelden](../../examples/) | Raspberry Pi-camera, neppe streams om te testen |

## Bijdragen

Issues en PR's zijn welkom. `pnpm install && pnpm dev` geeft je de volledige stack met testdata. Zie [CONTRIBUTING.md](../../CONTRIBUTING.md), en let op: PR-titels zijn conventional commits. We volgen een [Gedragscode](../../CODE_OF_CONDUCT.md).

## Licentie

[MIT](../../LICENSE)
