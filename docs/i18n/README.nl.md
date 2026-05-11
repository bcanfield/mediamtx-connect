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
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <a href="./README.fr.md">Français</a> •
  🇵🇹 <a href="./README.pt.md">Português</a> •
  🇯🇵 <a href="./README.ja.md">日本語</a> •
  🇵🇱 <a href="./README.pl.md">Polski</a> •
  🇰🇷 <a href="./README.ko.md">한국어</a> •
  🇹🇷 <a href="./README.tr.md">Türkçe</a> •
  🇳🇱 <strong>Nederlands</strong> •
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center">Een webinterface voor <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Bekijk streams, blader door opnames en bewerk de configuratie vanuit je browser.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect demo" width="720">
</p>

## Hoe uitvoeren

Heb je MediaMTX al draaien? Zet Connect ernaast:

```bash
docker run -d \
  -p 3000:3000 \
  -v /pad/naar/opnames:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Nog geen MediaMTX? De meegeleverde compose start beide:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Open http://localhost:3000, ga naar **Config** en richt het op je MediaMTX.

> Connect heeft `api: yes` nodig in je `mediamtx.yml`. Zie [het meegeleverde bestand](../../mediamtx.yml) als werkende referentie.

## Documentatie

[Architectuur](../../ARCHITECTURE.md) · [Functies](../../docs/FEATURES.md) · [Bijdragen](../../CONTRIBUTING.md)

> Opmerking: ontwikkelaarsdocumentatie wordt alleen in het Engels onderhouden. De applicatie-UI is in het Nederlands beschikbaar op `/nl`.

## Licentie

MIT
