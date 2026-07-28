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
  🇨🇿 <strong>Čeština</strong> •
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

<h4 align="center">Webové rozhraní pro <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Sledujte streamy, procházejte záznamy a upravujte konfiguraci z prohlížeče.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Ukázka MediaMTX Connect" width="720">
</p>

## Jak to spustit

Image jsou publikovány pro `linux/amd64` i `linux/arm64` (Raspberry Pi, Apple Silicon atd.) — Docker si ten správný stáhne automaticky.

Už máte spuštěné MediaMTX? Postavte Connect vedle něj:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /cesta/k/zaznamum:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` je adresa, na které Connect dosáhne na API MediaMTX *zevnitř* svého kontejneru. Výchozí hodnota je `http://mediamtx`, která se přeloží jen v síti přiloženého compose — pro samostatný `docker run` ji nastavte na svůj MediaMTX host (změnit ji můžete i později v **Config**).

Ještě nemáte MediaMTX? Přiložený compose spustí oba:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Otevřete http://localhost:3000, přejděte do **Config** a nasměrujte ho na vaše MediaMTX.

> Connect potřebuje `api: yes` ve vašem `mediamtx.yml`. Funkční referenci najdete v [přiloženém souboru](../../mediamtx.yml).

### Konfigurace

Vše lze konfigurovat za běhu v **Config**. Tyto proměnné prostředí slouží jen k naplnění při prvním spuštění:

| Proměnná | Výchozí hodnota | Účel |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Host API MediaMTX, dostupný z kontejneru Connectu |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Cesta na hostiteli připojená pro záznamy (jen compose; volitelné — bez nastavení se použije výchozí hodnota) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kam se ukládají vygenerované snímky obrazovky |

## Dokumentace

[Architektura](../../ARCHITECTURE.md) · [Funkce](../../docs/FEATURES.md) · [Přispívání](../../CONTRIBUTING.md)

> Poznámka: dokumentace pro vývojáře je udržována pouze v angličtině. Uživatelské rozhraní aplikace je v češtině dostupné na `/cs`.

## Kodex chování

Tento projekt se řídí [Kodexem chování](../../CODE_OF_CONDUCT.md). Účastí se očekává, že jej budete dodržovat.

## Licence

MIT
