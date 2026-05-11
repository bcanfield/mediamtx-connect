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
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center">Eine Web-Oberfläche für <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Streams ansehen, Aufzeichnungen durchsuchen und die Konfiguration im Browser bearbeiten.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect Demo" width="720">
</p>

## So führst du es aus

Du hast bereits MediaMTX laufen? Stelle Connect daneben:

```bash
docker run -d \
  -p 3000:3000 \
  -v /pfad/zu/aufzeichnungen:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Noch kein MediaMTX? Das mitgelieferte Compose startet beides:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Öffne http://localhost:3000, gehe zu **Config** und richte es auf dein MediaMTX aus.

> Connect benötigt `api: yes` in deiner `mediamtx.yml`. Siehe [die mitgelieferte Datei](../../mediamtx.yml) als funktionierende Referenz.

## Dokumentation

[Architektur](../../ARCHITECTURE.md) · [Funktionen](../../docs/FEATURES.md) · [Mitwirken](../../CONTRIBUTING.md)

> Hinweis: Die Entwicklerdokumentation wird nur auf Englisch gepflegt. Die Anwendungsoberfläche ist auf Deutsch unter `/de` verfügbar.

## Lizenz

MIT
