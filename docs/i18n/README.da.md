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
  🇨🇿 <a href="./README.cs.md">Čeština</a> •
  🇹🇼 <a href="./README.zh-tw.md">繁體中文</a> •
  🇧🇷 <a href="./README.pt-br.md">Português (BR)</a> •
  🇮🇩 <a href="./README.id.md">Bahasa Indonesia</a> •
  🇷🇴 <a href="./README.ro.md">Română</a> •
  🇸🇪 <a href="./README.sv.md">Svenska</a> •
  🇩🇰 <strong>Dansk</strong> •
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

<h4 align="center">En webgrænseflade til <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Se streams, gennemse optagelser, og rediger konfigurationen fra din browser.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect-demo" width="720">
</p>

## Sådan kører du det

Images udgives til både `linux/amd64` og `linux/arm64` (Raspberry Pi, Apple Silicon osv.) — Docker henter automatisk den rigtige.

Kører du allerede MediaMTX? Sæt Connect ved siden af den:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /sti/til/optagelser:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` er adressen, hvor Connect når MediaMTX' API *inde fra* sin container. Standardværdien er `http://mediamtx`, som kun kan slås op på det medfølgende compose-netværk — til en selvstændig `docker run` skal du sætte den til din MediaMTX-vært (du kan også ændre den senere under **Config**).

Har du ikke MediaMTX endnu? Den medfølgende compose starter begge:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Åbn http://localhost:3000, gå til **Config**, og peg den mod din MediaMTX.

> Connect skal bruge `api: yes` i din `mediamtx.yml`. Se [den vedlagte fil](../../mediamtx.yml) som en fungerende reference.

### Konfiguration

Alt kan konfigureres under kørsel under **Config**. Disse miljøvariabler bruges kun ved første opstart:

| Variabel | Standard | Formål |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | MediaMTX API-vært, som kan nås fra Connects container |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API-port |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Sti på værten, der monteres til optagelser (kun compose; valgfri — bruger standardværdien, hvis den ikke er sat) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor genererede skærmbilleder gemmes |

## Dokumentation

[Arkitektur](../../ARCHITECTURE.md) · [Funktioner](../../docs/FEATURES.md) · [Bidrag](../../CONTRIBUTING.md)

> Bemærk: udviklerdokumentation vedligeholdes kun på engelsk. Applikationens UI er tilgængelig på dansk på `/da`.

## Adfærdskodeks

Dette projekt følger et [adfærdskodeks](../../CODE_OF_CONDUCT.md). Ved at deltage forventes det, at du overholder det.

## Licens

MIT
