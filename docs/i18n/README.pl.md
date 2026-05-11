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
  🇵🇱 <strong>Polski</strong> •
  🇰🇷 <a href="./README.ko.md">한국어</a> •
  🇹🇷 <a href="./README.tr.md">Türkçe</a> •
  🇳🇱 <a href="./README.nl.md">Nederlands</a> •
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center">Interfejs WWW dla <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Oglądaj transmisje, przeglądaj nagrania i edytuj konfigurację z przeglądarki.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Demo MediaMTX Connect" width="720">
</p>

## Jak uruchomić

Masz już uruchomione MediaMTX? Postaw Connect obok niego:

```bash
docker run -d \
  -p 3000:3000 \
  -v /sciezka/do/nagran:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Nie masz jeszcze MediaMTX? Dołączony compose uruchamia oba:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Otwórz http://localhost:3000, przejdź do **Config** i wskaż swoje MediaMTX.

> Connect wymaga `api: yes` w pliku `mediamtx.yml`. Zobacz [dołączony plik](../../mediamtx.yml) jako działający przykład.

## Dokumentacja

[Architektura](../../ARCHITECTURE.md) · [Funkcje](../../docs/FEATURES.md) · [Wkład](../../CONTRIBUTING.md)

> Uwaga: dokumentacja dla deweloperów jest utrzymywana wyłącznie w języku angielskim. Interfejs aplikacji jest dostępny po polsku pod adresem `/pl`.

## Licencja

MIT
