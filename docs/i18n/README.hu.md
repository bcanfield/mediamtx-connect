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
  🇩🇰 <a href="./README.da.md">Dansk</a> •
  🇳🇴 <a href="./README.no.md">Norsk</a> •
  🇫🇮 <a href="./README.fi.md">Suomi</a> •
  🇬🇷 <a href="./README.el.md">Ελληνικά</a> •
  🇭🇺 <strong>Magyar</strong> •
  🇺🇦 <a href="./README.uk.md">Українська</a> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center">Webes felület a <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>-hez. Nézzen folyamokat, böngésszen felvételek között, és szerkessze a konfigurációt a böngészőből.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect demó" width="720">
</p>

## Hogyan futtassa

A képek `linux/amd64` és `linux/arm64` architektúrára egyaránt megjelennek (Raspberry Pi, Apple Silicon stb.) — a Docker automatikusan a megfelelőt tölti le.

Már fut a MediaMTX? Helyezze a Connectet mellé:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /utvonal/felvetelekhez:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

A `BACKEND_SERVER_MEDIAMTX_URL` adja meg, hol éri el a Connect a MediaMTX API-ját a saját konténerén *belülről*. Alapértelmezése `http://mediamtx`, ami csak a mellékelt compose hálózatán oldható fel — önálló `docker run` esetén állítsa a saját MediaMTX-gazdagépére (később a **Config**-ban is módosíthatja).

Nincs még MediaMTX? A mellékelt compose elindítja mindkettőt:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Nyissa meg a http://localhost:3000 címet, lépjen a **Config**-ra, és mutasson rá a MediaMTX-re.

> A Connectnek `api: yes` szükséges a `mediamtx.yml` fájljában. Lásd [a mellékelt fájlt](../../mediamtx.yml) működő referenciaként.

### Konfiguráció

Futásidőben minden beállítható a **Config**-ban. Ezek a környezeti változók csak az első indítást töltik fel kezdőértékekkel:

| Változó | Alapértelmezés | Cél |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | A MediaMTX API gazdagépe, amelyet a Connect konténere elér |
| `MEDIAMTX_API_PORT` | `9997` | A MediaMTX API portja |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | A felvételekhez csatolt gazdagép-útvonal (csak compose; opcionális — ha nincs megadva, az alapértelmezés érvényes) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Ide kerülnek a generált képernyőképek |

## Dokumentáció

[Architektúra](../../ARCHITECTURE.md) · [Funkciók](../../docs/FEATURES.md) · [Hozzájárulás](../../CONTRIBUTING.md)

> Megjegyzés: a fejlesztői dokumentáció csak angol nyelven van karbantartva. Az alkalmazás felülete magyar nyelven a `/hu` címen érhető el.

## Magatartási kódex

Ez a projekt egy [magatartási kódexet](../../CODE_OF_CONDUCT.md) követ. A részvétellel elvárt, hogy betartsd azt.

## Licenc

MIT
