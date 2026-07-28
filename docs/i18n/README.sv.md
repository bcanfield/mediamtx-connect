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
  🇸🇪 <strong>Svenska</strong> •
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

<h4 align="center">Ett webbgränssnitt för <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Titta på strömmar, bläddra bland inspelningar och redigera konfigurationen från webbläsaren.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect-demo" width="720">
</p>

## Så här kör du det

Avbildningar publiceras för både `linux/amd64` och `linux/arm64` (Raspberry Pi, Apple Silicon med flera) — Docker hämtar rätt avbildning automatiskt.

Kör du redan MediaMTX? Lägg Connect bredvid den:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /sokvag/till/inspelningar:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` är adressen där Connect når MediaMTX API *inifrån* sin container. Standardvärdet är `http://mediamtx`, som bara går att slå upp i det medföljande compose-nätverket — för en fristående `docker run` pekar du den mot din MediaMTX-värd (du kan även ändra den senare under **Config**).

Har du ingen MediaMTX än? Den medföljande compose-filen startar båda:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Öppna http://localhost:3000, gå till **Config** och peka det mot din MediaMTX.

> Connect behöver `api: yes` i din `mediamtx.yml`. Se [den inkluderade filen](../../mediamtx.yml) som en fungerande referens.

### Konfiguration

Allt går att konfigurera under drift via **Config**. De här miljövariablerna används bara vid första starten:

| Variabel | Standard | Syfte |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Värd för MediaMTX API, nåbar från Connects container |
| `MEDIAMTX_API_PORT` | `9997` | Port för MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Sökväg på värden som monteras för inspelningar (endast compose; valfri — standardvärde används om den inte anges) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Var genererade skärmbilder lagras |

## Dokumentation

[Arkitektur](../../ARCHITECTURE.md) · [Funktioner](../../docs/FEATURES.md) · [Bidra](../../CONTRIBUTING.md)

> Obs: utvecklardokumentation underhålls endast på engelska. Applikationens gränssnitt finns på svenska på `/sv`.

## Uppförandekod

Det här projektet följer en [uppförandekod](../../CODE_OF_CONDUCT.md). Genom att delta förväntas du upprätthålla den.

## Licens

MIT
