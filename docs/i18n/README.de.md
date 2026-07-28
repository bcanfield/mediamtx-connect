<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
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

<h4 align="center">Eine Web-Oberfläche für <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Streams ansehen, Aufzeichnungen durchsuchen und die Konfiguration im Browser bearbeiten.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect Demo" width="720">
</p>

## So führst du es aus

Images werden sowohl für `linux/amd64` als auch für `linux/arm64` (Raspberry Pi, Apple Silicon usw.) veröffentlicht — Docker lädt automatisch das passende herunter.

Du hast bereits MediaMTX laufen? Stelle Connect daneben:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /pfad/zu/aufzeichnungen:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` ist die Adresse, unter der Connect die API von MediaMTX von *innerhalb* seines Containers erreicht. Standardwert ist `http://mediamtx`, was nur im mitgelieferten Compose-Netzwerk auflösbar ist — für ein eigenständiges `docker run` setze ihn auf deinen MediaMTX-Host (du kannst ihn später auch unter **Config** ändern).

Noch kein MediaMTX? Das mitgelieferte Compose startet beides:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Öffne http://localhost:3000, gehe zu **Config** und richte es auf dein MediaMTX aus.

> Connect benötigt `api: yes` in deiner `mediamtx.yml`. Siehe [die mitgelieferte Datei](../../mediamtx.yml) als funktionierende Referenz.

### Konfiguration

Alles lässt sich zur Laufzeit unter **Config** konfigurieren. Diese Umgebungsvariablen dienen nur als Startwerte für den ersten Start:

| Variable | Standard | Zweck |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | MediaMTX-API-Host, erreichbar aus dem Container von Connect |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX-API-Port |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Host-Pfad, der für Aufzeichnungen eingebunden wird (nur Compose; optional — Standardwert, wenn nicht gesetzt) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Wo erzeugte Screenshots gespeichert werden |

## Dokumentation

[Architektur](../../ARCHITECTURE.md) · [Funktionen](../../docs/FEATURES.md) · [Mitwirken](../../CONTRIBUTING.md)

> Hinweis: Die Entwicklerdokumentation wird nur auf Englisch gepflegt. Die Anwendungsoberfläche ist auf Deutsch unter `/de` verfügbar.

## Verhaltenskodex

Dieses Projekt folgt einem [Verhaltenskodex](../../CODE_OF_CONDUCT.md). Durch die Teilnahme wird erwartet, dass du ihn einhältst.

## Lizenz

MIT
