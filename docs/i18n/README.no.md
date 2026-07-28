<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webgrensesnittet for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Se direktestrømmer, bla i opptak og rediger hvilken som helst konfigurasjonsnøkkel — fra nettleseren.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — rutenett med direktestrømmer, opptaksutforsker og konfigurasjonsredigerer" width="860">

</div>

## Hva det er

MediaMTX er en utmerket strømmeserver, og den kommer uten grensesnitt. Connect er frontenden som mangler: én container som snakker med MediaMTX-API-et og gjør det om til en kameravegg, et opptaksarkiv og en konfigurasjonsredigerer.

Det er en følgesvenn, ikke en erstatning. Hver skjerm hviler på noe MediaMTX allerede eksponerer — en path, et API-endepunkt, en `runOn*`-hook, en protokoll den serverer selv. Connect lagrer ingen video, videresender ingen medier og har ingen database. Pek den mot en server som kjører, så virker det.

## Kom raskt i gang

Images publiseres for `linux/amd64` og `linux/arm64` (Raspberry Pi, Apple Silicon og slektninger), så Docker henter den riktige for deg.

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

Uansett: åpne <http://localhost:3000>.

> [!IMPORTANT]
> Connect trenger `api: yes` i `mediamtx.yml` — det er gjennom det API-et alt leses og skrives. Den [medfølgende konfigurasjonen](../../mediamtx.yml) er en fungerende mal.

## Hva du får

### Direktevisning

Et rutenett over hver path MediaMTX kjenner til, i 2, 3 eller 4 kolonner.

- **WebRTC eller HLS, per kort.** `AUTO` foretrekker WebRTC og faller stille tilbake til HLS, `LOW-LAT` krever WebRTC, og `COMPAT` tvinger HLS. Hvert kort forhandler sin egen tilkobling og melder transporten det faktisk fikk — aldri den du ba om.
- **Stillbilder også i ro.** En bakgrunnsjobb henter et bilde fra hver strøm, så inaktive kort viser likevel scenen, med bildets alder på merket. «Ta stillbilde» henter ett med én gang.
- **Direkte telemetri.** Kodek-merker, antall seere og oppetid, rett fra path-lista — uten ekstra forespørsler.
- **Opptaksstatus som forteller sannheten.** Kortene viser om en strøm *faktisk* tar opp (dens egen override lagt oppå path defaults, akkurat slik MediaMTX løser det); en status som ikke kunne leses, vises som ukjent i stedet for som av.
- **Publiserings-URL-er til utklippstavlen.** RTSP-, RTMP- og SRT-mål bygget fra serverens egne lytteadresser, slik at en endret port fortsatt er riktig port.

### Opptak

- MP4-filene til hver strøm, gruppert per dag, nyeste først, med automatisk genererte miniatyrbilder.
- En spiller som folder seg ut på stedet, med en ekte søkelinje bygget på HTTP Range-forespørsler.
- Nedlastinger som strømmer, med fremdrift i sanntid, hastighet og avbryt-knapp.
- Trykk `/` hvor som helst for å filtrere.

### Konfigurasjon uten YAML

- **Hele serverkonfigurasjonen** — 65 kontroller fordelt på Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC og SRT, hver av dem typet, validert og dokumentert på ditt språk.
- **Path defaults og overstyringer per path**, på de scopene MediaMTX faktisk serverer dem fra. Å lagre en strøm dekket av et jokertegn materialiserer en tynn oppføring, så urørte nøkler følger fortsatt standardverdiene — og «tilbake til arvet» angrer det.
- **Alle 15 `runOn*`-path-hookene**, med en advarsel der lagring starter path-en på nytt.
- **Tynne skriveoperasjoner.** Connect sender PATCH kun med nøklene du endret; det den ikke viser, lar den være.

### Laget for en boks du glemmer

Én prosess serverer API, SPA og medier · multiarkitektur-images · `GET /health` · strukturerte logger · installerbar PWA · lyst og mørkt tema · 30 språk · ingen database.

## Miljøvariabler

Alt dette kan endres mens det kjører under **Config** — variablene sår bare aller første oppstart.

| Variabel | Standard | Hensikt |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hvor Connect når MediaMTX-API-et *fra innsiden* av containeren sin |
| `MEDIAMTX_API_PORT` | `9997` | Port for MediaMTX-API-et |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Vertssti montert for opptak (kun compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor genererte miniatyrbilder havner |

Standardverdien `http://mediamtx` slås bare opp i nettverket til den medfølgende compose-filen. For en frittstående `docker run` peker du den mot din egen MediaMTX-vert — eller retter det senere under **Config**, uten omstart.

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

Avspillingen går rett fra nettleseren til MediaMTX. Connect flytter bare JSON, pluss opptakene og miniatyrbildene den leser fra disk.

## Dokumentasjon

| | |
|---|---|
| [Funksjoner](../FEATURES.md) | Hver leverte evne, rute og prosedyre |
| [Arkitektur](../../ARCHITECTURE.md) | Hvordan delene henger sammen |
| [Bidra](../../CONTRIBUTING.md) | Utviklingsoppsett, skript, PR-prosess |
| [Eksempler](../../examples/) | Raspberry Pi-kamera, falske strømmer for testing |

## Bidra

Issues og PR-er er velkomne. `pnpm install && pnpm dev` gir deg hele stakken med testdata — se [CONTRIBUTING.md](../../CONTRIBUTING.md) for resten, og merk at PR-titler er [conventional commits](../../CONTRIBUTING.md). Prosjektet følger en [oppførselskodeks](../../CODE_OF_CONDUCT.md).

## Lisens

[MIT](../../LICENSE)
