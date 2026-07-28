<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webgrensesnittet for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Se direktestrømmer, bla i opptak, rediger hvilken som helst konfigurasjonsnøkkel — fra nettleseren.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — rutenett med direktestrømmer, opptaksutforsker og konfigurasjonsredigerer" width="860">

<details>
<summary>🌍 Les på 30 språk</summary>
<p>
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
  🇳🇴 <strong>Norsk</strong> •
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
</details>

</div>

## Hva det er

MediaMTX er en utmerket strømmeserver uten grensesnitt. Connect er frontenden som mangler: én container som snakker med MediaMTX-API-et og gjør det om til en kameravegg, et opptaksarkiv og en konfigurasjonsredigerer.

Det er en følgesvenn, ikke en erstatning. Hver skjerm hviler på noe MediaMTX allerede eksponerer: en path, et API-endepunkt, en `runOn*`-hook, en protokoll den serverer selv. Ingen video lagres, ingen medier videresendes, ingen database.

## Kom raskt i gang

Multiarkitektur-images (`linux/amd64`, `linux/arm64`) — Docker henter den riktige.

**Kjører MediaMTX allerede?** Sett Connect ved siden av:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Starter du fra ingenting?** Den medfølgende compose-filen starter begge:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Åpne så <http://localhost:3000>.

> [!IMPORTANT]
> Connect trenger `api: yes` i `mediamtx.yml`. Den [medfølgende konfigurasjonen](../../mediamtx.yml) virker som den er.

## Hva du får

### Direktevisning

Hver path MediaMTX kjenner til, i et rutenett på 2 til 4 kolonner.

- **WebRTC eller HLS, per kort.** `AUTO` faller stille tilbake til HLS, `LOW-LAT` krever WebRTC, `COMPAT` tvinger HLS — og hvert kort melder transporten det faktisk fikk.
- **Stillbilder i ro.** En bakgrunnsjobb holder et ferskt bilde på hvert kort, med bildets alder på merket.
- **Direkte telemetri.** Kodeker, antall seere og oppetid, rett fra path-lista.
- **Ærlig opptaksstatus.** Kortene viser om en strøm *faktisk* tar opp; en status Connect ikke kunne lese heter ukjent, aldri av.
- **Publiserings-URL-er til utklippstavlen.** RTSP, RTMP og SRT, bygget fra serverens egne lytteadresser.

### Opptak

- MP4-filene til hver strøm, gruppert per dag, med automatiske miniatyrbilder.
- En spiller som folder seg ut på stedet, spolbar via HTTP Range-forespørsler.
- Nedlastinger som strømmer, med fremdrift i sanntid og avbryt.
- Trykk `/` for å filtrere.

### Konfigurasjon uten YAML

- **Hele serverkonfigurasjonen** — 65 typede, validerte kontroller fordelt på Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC og SRT.
- **Path defaults og overstyringer per path**, på de scopene MediaMTX serverer dem fra. Å lagre en strøm dekket av et jokertegn skriver en tynn oppføring, så urørte nøkler fortsetter å arve.
- **Alle 15 `runOn*`-hookene**, med en advarsel der lagring starter path-en på nytt.
- **Tynne skriveoperasjoner** — bare nøklene du endret.

### Drift

Én prosess for API, SPA og medier · multiarkitektur · `GET /health` · strukturerte logger · PWA · lyst og mørkt · 30 språk · ingen database.

## Miljøvariabler

De sår bare aller første oppstart. Resten kan endres under **Config**.

| Variabel | Standard | Hensikt |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hvor Connect når MediaMTX-API-et fra innsiden av containeren sin |
| `MEDIAMTX_API_PORT` | `9997` | Port for MediaMTX-API-et |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Vertssti montert for opptak (kun compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor miniatyrbilder havner |

`http://mediamtx` slås bare opp i nettverket til den medfølgende compose-filen — for en frittstående `docker run` peker du den mot din egen vert.

## Slik virker det

```
Browser ──HLS / WebRTC (WHEP)──────────────────────────┐
   │                                                   │
   │ oRPC (typed)                                      ▼
   ▼                                              ┌──────────┐
┌─────────────────────┐    MediaMTX HTTP API      │ MediaMTX │
│ mediamtx-connect    │ ────────────────────────▶ │  server  │
│ Hono API + React SPA│                           └──────────┘
└─────────────────────┘                                │
   │ reads                                             │ writes
   ▼                                                   ▼
recordings/ + screenshots/  ◀────────────────────  MP4 segments
```

Avspillingen går fra nettleseren til MediaMTX. Connect flytter bare JSON, pluss opptakene og miniatyrbildene den leser fra disk.

## Dokumentasjon

| | |
|---|---|
| [Funksjoner](../FEATURES.md) | Hver leverte evne, rute og prosedyre |
| [Arkitektur](../../ARCHITECTURE.md) | Hvordan delene henger sammen |
| [Bidra](../../CONTRIBUTING.md) | Utviklingsoppsett, skript, PR-prosess |
| [Eksempler](../../examples/) | Raspberry Pi-kamera, falske strømmer for testing |

## Bidra

Issues og PR-er er velkomne. `pnpm install && pnpm dev` gir deg hele stakken med testdata — se [CONTRIBUTING.md](../../CONTRIBUTING.md), og merk at PR-titler er conventional commits. Vi følger en [oppførselskodeks](../../CODE_OF_CONDUCT.md).

## Lisens

[MIT](../../LICENSE)
