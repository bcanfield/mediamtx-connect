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
  🇷🇴 <strong>Română</strong> •
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

<h4 align="center">Interfață web pentru <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Vizionați fluxuri, răsfoiți înregistrări și editați configurația din browser.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Demonstrație MediaMTX Connect" width="720">
</p>

## Cum se execută

Imaginile sunt publicate atât pentru `linux/amd64`, cât și pentru `linux/arm64` (Raspberry Pi, Apple Silicon etc.) — Docker o descarcă automat pe cea potrivită.

Aveți deja MediaMTX în execuție? Adăugați Connect alături:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /cale/catre/inregistrari:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` este adresa la care Connect ajunge la API-ul MediaMTX din *interiorul* containerului său. Valoarea implicită este `http://mediamtx`, care se rezolvă doar în rețeaua compose inclusă — pentru un `docker run` de sine stătător, setați-o către gazda dvs. MediaMTX (o puteți schimba și ulterior din **Config**).

Încă nu aveți MediaMTX? Fișierul compose inclus le pornește pe ambele:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Deschideți http://localhost:3000, mergeți la **Config** și îndreptați-l către MediaMTX-ul dvs.

> Connect are nevoie de `api: yes` în `mediamtx.yml`. Vedeți [fișierul inclus](../../mediamtx.yml) ca referință funcțională.

### Configurare

Totul se poate configura în timpul execuției din **Config**. Aceste variabile de mediu sunt folosite doar la prima pornire:

| Variabilă | Implicit | Scop |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Gazda API-ului MediaMTX, accesibilă din containerul Connect |
| `MEDIAMTX_API_PORT` | `9997` | Portul API-ului MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Calea de pe gazdă montată pentru înregistrări (doar compose; opțional — se folosește valoarea implicită dacă nu este setată) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Unde sunt stocate capturile de ecran generate |

## Documentație

[Arhitectură](../../ARCHITECTURE.md) · [Funcționalități](../../docs/FEATURES.md) · [Contribuire](../../CONTRIBUTING.md)

> Notă: documentația pentru dezvoltatori este menținută doar în engleză. Interfața aplicației este disponibilă în română la `/ro`.

## Cod de conduită

Acest proiect respectă un [Cod de conduită](../../CODE_OF_CONDUCT.md). Prin participare, ești de acord să îl respecți.

## Licență

MIT
