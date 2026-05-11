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
  🇳🇱 <a href="./README.nl.md">Nederlands</a> •
  🇨🇿 <strong>Čeština</strong>
</p>

<h4 align="center">Webové rozhraní pro <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Sledujte streamy, procházejte záznamy a upravujte konfiguraci z prohlížeče.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Ukázka MediaMTX Connect" width="720">
</p>

## Jak to spustit

Už máte spuštěné MediaMTX? Postavte Connect vedle něj:

```bash
docker run -d \
  -p 3000:3000 \
  -v /cesta/k/zaznamum:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Ještě nemáte MediaMTX? Přiložený compose spustí oba:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Otevřete http://localhost:3000, přejděte do **Config** a nasměrujte ho na vaše MediaMTX.

> Connect potřebuje `api: yes` ve vašem `mediamtx.yml`. Funkční referenci najdete v [přiloženém souboru](../../mediamtx.yml).

## Dokumentace

[Architektura](../../ARCHITECTURE.md) · [Funkce](../../docs/FEATURES.md) · [Přispívání](../../CONTRIBUTING.md)

> Poznámka: dokumentace pro vývojáře je udržována pouze v angličtině. Uživatelské rozhraní aplikace je v češtině dostupné na `/cs`.

## Licence

MIT
