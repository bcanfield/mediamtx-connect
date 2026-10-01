<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Die Weboberfläche für <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Live-Streams ansehen, Aufnahmen durchsuchen und die MediaMTX-Konfiguration bearbeiten, direkt im Browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — Live-Raster, Aufnahmebrowser und Konfigurationseditor" width="860">

<details>
<summary>🌍 In 30 Sprachen lesen</summary>
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
</details>

</div>

## Was es ist

MediaMTX ist ein hervorragender Streaming-Server ohne Oberfläche. Connect ist das fehlende Frontend: ein Container, der mit der MediaMTX-API spricht und sie in eine Kamerawand, ein Aufnahmearchiv und einen Konfigurationseditor verwandelt.

Es ist eine Ergänzung, kein Ersatz. Jede Ansicht bildet etwas ab, das MediaMTX bereits bereitstellt: einen Path, einen API-Endpunkt, einen `runOn*`-Hook, ein Protokoll, das es nativ ausliefert. Kein Video gespeichert, keine Medien geproxyt, keine Datenbank.

## Schnellstart

Multi-Arch-Images (`linux/amd64`, `linux/arm64`); Docker zieht das passende.

**MediaMTX läuft schon?** Stell Connect daneben:

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

**Bei null angefangen?** Das mitgelieferte Compose baut Connect und startet es neben MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Dann <http://localhost:3000> öffnen.

> [!IMPORTANT]
> Connect braucht `api: yes` in deiner `mediamtx.yml`. Die [mitgelieferte Konfiguration](../../mediamtx.yml) funktioniert direkt.

## Was du bekommst

### Live-Ansicht

Alle Paths, die MediaMTX kennt, als Raster mit 2 bis 4 Spalten.

- **WebRTC oder HLS, pro Kachel.** `AUTO` weicht still aus, `LOW-LAT` besteht auf WebRTC, `COMPAT` erzwingt HLS. Jede Kachel meldet den Transport, den sie tatsächlich bekommen hat.
- **Schnappschüsse im Leerlauf.** Ein Hintergrundjob hält auf jeder Kachel ein aktuelles Einzelbild bereit, mit dessen Alter auf der Pille. Du brauchst sofort ein frisches? Hol es dir über das Kachelmenü.
- **Live-Telemetrie.** Codecs, Zuschauerzahl und Laufzeit, direkt aus der Path-Liste.
- **Ehrlicher Aufnahmestatus.** Kacheln zeigen, ob ein Stream *effektiv* aufzeichnet; einen Status, den Connect nicht lesen konnte, nennt es unbekannt, nie aus.
- **Publish-URLs in der Zwischenablage.** RTSP, RTMP und SRT, gebaut aus den Listen-Adressen des Servers selbst. Die Seite jedes Paths geht weiter, mit einem Panel zum Publizieren und Lesen: jedes Protokoll, das der Server ausliefert, einschließlich WHIP, WHEP, HLS und der TLS-Varianten, mit kopierfertigen Snippets für ffmpeg, GStreamer, OBS, ffplay und VLC.

### Aufnahmen

- Eine Tageszeitleiste pro Stream vom Playback-Server von MediaMTX: aufgezeichnete Abschnitte und die Lücken dazwischen, jeder einzeln abspielbar. Ist Playback aus, listet Connect die genauen Konfigurationsänderungen auf, die es braucht, und wendet sie mit einem Klick an.
- Clip-Download: jeder Bereich bis zu einer Stunde (oder die letzten 5 Min., 15 Min. oder die letzte Stunde) als eine einfache MP4, von MediaMTX ohne Neukodierung über Segmente hinweg zusammengefügt.
- MP4- oder MPEG-TS-Segmente pro Stream, nach Tag gruppiert, mit automatisch erzeugten Vorschaubildern.
- Ein eingebetteter Player, der sich an Ort und Stelle aufklappt, spulbar über HTTP-Range-Requests.
- Downloads, die streamen, mit Fortschritt in Echtzeit und Abbruch.
- Zum Filtern `/` drücken.

### Sitzungen

- **Alle Verbundenen in einer Tabelle.** Publisher und Leser über RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC und HLS, mit Remote-Adresse, ein- und ausgehenden Bytes und Laufzeit, alle 5 Sekunden aktualisiert.
- **Einen Client rauswerfen**, nach einer Bestätigung. Er kann sich neu verbinden; ein Rauswurf ist keine Sperre.

### Konfiguration, ohne YAML

- **Die Serverkonfiguration:** 66 typisierte, validierte Bedienelemente über Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC und SRT.
- **Path-Defaults und Overrides pro Path**, auf den Scopes, aus denen MediaMTX sie ausliefert. Speichern bei einem per Wildcard abgedeckten Stream schreibt einen sparsamen Eintrag, sodass unberührte Schlüssel weiter den Defaults folgen.
- **Ein Path-Katalog** mit Live- und Regex-Badges, einem geführten Formular „RTSP-Kamera hinzufügen“ sowie Zurücksetzen oder Löschen des eigenen Eintrags eines Paths (mit Warnung, wenn jemand verbunden ist).
- **Live-Zustand auf der Seite jedes Paths:** Tracks, Leser, übertragene Bytes, fehlerhafte Frames und Laufzeit, alle 5 Sekunden aktualisiert. Ein Path, auf dem nichts publiziert, gilt als untätig, nicht als kaputt.
- **Ausfallsicherheit pro Path:** ein stets verfügbarer Fallback, der einen Offline-Clip in Schleife abspielt, solange die Kamera ausgefallen ist, und Pulling bei Bedarf, das die Quelle nur öffnet, während jemand zuschaut.
- **Jeder `runOn*`-Hook**, mit Warnung dort, wo Speichern den Path neu startet.
- **Weiterleitung:** einen Path über die native `forward`-Liste von MediaMTX an YouTube, Twitch oder einen anderen Server pushen, mit maskierten Stream-Keys und ohne Path-Neustart.
- **Sparsame Schreibvorgänge.** Nur die Schlüssel, die du geändert hast, werden gesendet.

### Betrieb

Ein Prozess für API, SPA und Medien · Multi-Arch · `GET /api/health` · MediaMTX-Version im Header · strukturierte Logs · als PWA installierbar · hell und dunkel · 30 Sprachen · keine Datenbank.

## Umgebungsvariablen

Sie setzen nur den ersten Start auf. Danach bleibt alles unter **Config** änderbar.

| Variable | Standard im Image | Zweck |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Wo Connect die MediaMTX-API erreicht |
| `MEDIAMTX_API_PORT` | `9997` | Port der MediaMTX-API |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Wo der *Browser* MediaMTX für die Wiedergabe erreicht. Setze sie immer dann, wenn der Browser nicht auf dem Server läuft |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Wo Connect Aufnahmen liest |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Wo Schnappschüsse und Vorschaubilder abgelegt werden |
| `DATA_DIR` | `/data` | Wo `config.json` liegt |
| `PORT` | `3000` | HTTP-Port |
| `LOG_LEVEL` | `info` | Log-Level von Pino |

`http://mediamtx` löst nur im Netz des mitgelieferten Compose auf. Für ein eigenständiges `docker run` auf deinen Host zeigen. Mit Compose setzt du `REMOTE_MEDIAMTX_HOST` in `.env` statt `REMOTE_MEDIAMTX_URL`: Das setzt auch den WebRTC-Host, den MediaMTX ankündigt. [`.env.example`](../../.env.example) erklärt jede einzelne, und `pnpm dev` nutzt localhost-Standardwerte ganz ohne `.env`.

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

Die Live-Wiedergabe läuft vom Browser zu MediaMTX. Connect bewegt JSON, dazu die Aufnahmen und Vorschaubilder: von der Platte oder als aufgezeichnete Abschnitte, die es vom Playback-Server von MediaMTX durchreicht.

## Dokumentation

| | |
|---|---|
| [Funktionen](../../docs/FEATURES.md) | Jede ausgelieferte Fähigkeit, Route und Prozedur |
| [Architektur](../../docs/ARCHITECTURE.md) | Wie die Teile zusammenpassen |
| [Mitmachen](../../CONTRIBUTING.md) | Dev-Setup, Skripte, PR-Prozess |
| [Beispiele](../../examples/) | Raspberry-Pi-Kamera, Fake-Streams zum Testen |

## Mitmachen

Issues und PRs sind willkommen. `pnpm install && pnpm dev` bringt dir den kompletten Stack samt Testdaten. Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md), und beachte: PR-Titel sind Conventional Commits. Wir folgen einem [Verhaltenskodex](../../CODE_OF_CONDUCT.md).

## Lizenz

[MIT](../../LICENSE)
