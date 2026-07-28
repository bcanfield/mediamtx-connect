<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Die Weboberfläche für <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Live-Streams ansehen, Aufnahmen durchsuchen und jeden Konfigurationsschlüssel bearbeiten — im Browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<p>
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <strong>Deutsch</strong> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <a href="./README.fr.md">Français</a> •
  🇵🇹 <a href="./README.pt.md">Português</a> •
  🇯🇵 <a href="./README.ja.md">日本語</a> •
  🇵🇱 <a href="./README.pl.md">Polski</a> •
  🇰🇷 <a href="./README.ko.md">한국어</a> •
  🇹🇷 <a href="./README.tr.md">Türkçe</a> •
  🇳🇱 <a href="./README.nl.md">Nederlands</a> •
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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — Live-Raster, Aufnahmebrowser und Konfigurationseditor" width="860">

</div>

## Was es ist

MediaMTX ist ein hervorragender Streaming-Server und kommt ohne Oberfläche. Connect ist das fehlende Frontend: ein Container, der mit der MediaMTX-API spricht und sie in eine Kamerawand, ein Aufnahmearchiv und einen Konfigurationseditor verwandelt.

Es ist eine Ergänzung, kein Ersatz. Jede Ansicht bildet etwas ab, das MediaMTX bereits bereitstellt — einen Path, einen API-Endpunkt, einen `runOn*`-Hook, ein Protokoll, das es nativ ausliefert. Connect speichert kein Video, proxyt keine Medien und braucht keine Datenbank. Auf einen laufenden Server zeigen — fertig.

## Schnellstart

Images erscheinen für `linux/amd64` und `linux/arm64` (Raspberry Pi, Apple Silicon und Verwandte), Docker zieht also automatisch das passende.

**MediaMTX läuft schon?** Stell Connect daneben:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Bei null angefangen?** Das mitgelieferte Compose startet beides:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

So oder so: <http://localhost:3000> öffnen.

> [!IMPORTANT]
> Connect braucht `api: yes` in deiner `mediamtx.yml` — über diese API liest und schreibt es alles. Die [mitgelieferte Konfiguration](../../mediamtx.yml) ist eine funktionierende Vorlage.

## Was du bekommst

### Live-Ansicht

Ein Raster aller Paths, die MediaMTX kennt — in 2, 3 oder 4 Spalten.

- **WebRTC oder HLS, pro Kachel.** `AUTO` bevorzugt WebRTC und fällt still auf HLS zurück, `LOW-LAT` besteht auf WebRTC, `COMPAT` erzwingt HLS. Jede Kachel handelt ihre eigene Verbindung aus und meldet den Transport, den sie tatsächlich bekommen hat — nie den angeforderten.
- **Schnappschüsse im Leerlauf.** Ein Hintergrundjob greift von jedem Stream ein Einzelbild ab, damit auch ruhende Kacheln die Szene zeigen — mit dem Alter des Bildes auf der Pille. «Schnappschuss aufnehmen» holt sofort eines.
- **Live-Telemetrie.** Codec-Chips, Zuschauerzahl und Laufzeit, direkt aus der Path-Liste — ohne zusätzliche Requests.
- **Aufnahmestatus, der die Wahrheit sagt.** Kacheln zeigen, ob ein Stream *effektiv* aufzeichnet (sein eigener Override über die Path-Defaults gelegt, so wie MediaMTX es auflöst); ein nicht lesbarer Status erscheint als unbekannt statt als aus.
- **Publish-URLs in der Zwischenablage.** RTSP-, RTMP- und SRT-Ziele, gebaut aus den Listen-Adressen des Servers selbst — ein geänderter Port bleibt damit der richtige Port.

### Aufnahmen

- Die MP4s jedes Streams, nach Tag gruppiert, neueste zuerst, mit automatisch erzeugten Vorschaubildern.
- Ein Player, der sich an Ort und Stelle aufklappt — mit echter Suchleiste auf Basis von HTTP-Range-Requests.
- Downloads, die streamen: Fortschritt in Echtzeit, Durchsatz und Abbrechen-Knopf.
- Überall `/` drücken, um zu filtern.

### Konfiguration, ohne YAML

- **Die gesamte Serverkonfiguration** — 65 Bedienelemente über Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC und SRT, jedes typisiert, validiert und in deiner Sprache dokumentiert.
- **Path-Defaults und Overrides pro Path**, auf genau den Scopes, aus denen MediaMTX sie ausliefert. Speichern bei einem per Wildcard abgedeckten Stream materialisiert einen sparsamen Eintrag, sodass unberührte Schlüssel weiter den Defaults folgen — «auf geerbt zurücksetzen» macht es rückgängig.
- **Alle 15 `runOn*`-Path-Hooks**, mit Warnung dort, wo ein Speichern den Path neu startet.
- **Sparsame Schreibvorgänge.** Connect PATCHt nur die geänderten Schlüssel; was es nicht anzeigt, bleibt unangetastet.

### Gebaut für eine Kiste, die man vergisst

Ein Prozess für API, SPA und Medien · Multi-Arch-Images · `GET /health` · strukturierte Logs · installierbare PWA · helles und dunkles Theme · 30 Sprachen · keine Datenbank.

## Umgebungsvariablen

Alles hiervon ist zur Laufzeit unter **Config** änderbar — diese Variablen setzen nur den ersten Start auf.

| Variable | Standard | Zweck |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Wo Connect die MediaMTX-API von *innerhalb* seines Containers erreicht |
| `MEDIAMTX_API_PORT` | `9997` | Port der MediaMTX-API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Host-Pfad, der für Aufnahmen gemountet wird (nur Compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Wo erzeugte Vorschaubilder abgelegt werden |

Der Standard `http://mediamtx` löst nur im Netz des mitgelieferten Compose auf. Für ein eigenständiges `docker run` auf deinen MediaMTX-Host setzen — oder später unter **Config** korrigieren, ganz ohne Neustart.

## Wie es funktioniert

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

Die Wiedergabe läuft direkt vom Browser zu MediaMTX. Connect bewegt nur JSON, dazu die Aufnahmen und Vorschaubilder, die es von der Platte liest.

## Dokumentation

| | |
|---|---|
| [Funktionen](../FEATURES.md) | Jede ausgelieferte Fähigkeit, Route und Prozedur |
| [Architektur](../../ARCHITECTURE.md) | Wie die Teile zusammenpassen |
| [Mitmachen](../../CONTRIBUTING.md) | Dev-Setup, Skripte, PR-Prozess |
| [Beispiele](../../examples/) | Raspberry-Pi-Kamera, Fake-Streams zum Testen |

## Mitmachen

Issues und PRs sind willkommen. `pnpm install && pnpm dev` bringt dir den kompletten Stack samt Testdaten — den Rest erklärt [CONTRIBUTING.md](../../CONTRIBUTING.md), und beachte: PR-Titel sind [Conventional Commits](../../CONTRIBUTING.md). Dieses Projekt folgt einem [Verhaltenskodex](../../CODE_OF_CONDUCT.md).

## Lizenz

[MIT](../../LICENSE)
