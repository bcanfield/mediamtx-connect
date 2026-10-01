<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webgrensesnittet for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Se direktestrømmer, bla i opptak og rediger MediaMTX-konfigurasjonen din fra nettleseren.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — rutenett med direktestrømmer, opptaksleser og konfigurasjonsredigerer" width="860">

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

Det er en følgesvenn, ikke en erstatning. Hver skjerm svarer til noe MediaMTX allerede eksponerer: en path, et API-endepunkt, en `runOn*`-hook, en protokoll den serverer selv. Ingen video lagres, ingen medier videresendes, ingen database.

## Kom raskt i gang

Multiarkitektur-images (`linux/amd64`, `linux/arm64`); Docker henter den riktige.

**Kjører MediaMTX allerede?** Sett Connect ved siden av:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -e REMOTE_MEDIAMTX_URL=http://<host-your-browser-uses> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  -v mediamtx-connect-screenshots:/screenshots \
  bcanfield/mediamtx-connect:latest
```

**Starter du fra ingenting?** Den medfølgende compose-filen bygger Connect og kjører den ved siden av MediaMTX:

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

Hver path MediaMTX kjenner til, i et rutenett på 2–4 kolonner.

- **WebRTC eller HLS, per kort.** `AUTO` faller stille tilbake, `LOW-LAT` krever WebRTC, `COMPAT` tvinger HLS. Hvert kort melder transporten det faktisk fikk.
- **Stillbilder i ro.** En bakgrunnsjobb holder et ferskt bilde på hvert kort, med bildets alder på merket. Trenger du et nytt med en gang? Ta det fra kortmenyen.
- **Direkte telemetri.** Kodeker, antall seere og oppetid, rett fra path-lista.
- **Ærlig opptaksstatus.** Kortene viser om en strøm *faktisk* tar opp; en status Connect ikke kunne lese heter ukjent, aldri av.
- **Publiserings-URL-er til utklippstavlen.** RTSP, RTMP og SRT, bygget fra serverens egne lytteadresser. Siden for hver path går lenger med et panel for publisering og lesing: hver protokoll serveren serverer, inkludert WHIP, WHEP, HLS og TLS-variantene, med kodesnutter klare til kopiering for ffmpeg, GStreamer, OBS, ffplay og VLC.

### Opptak

- En dagstidslinje per strøm fra MediaMTX sin avspillingsserver: innspilte strekk og hullene mellom dem, hver av dem avspillbar. Er avspilling slått av, lister Connect opp nøyaktig hvilke konfigurasjonsendringer som trengs og tar dem i bruk med ett klikk.
- Nedlasting av klipp: et hvilket som helst intervall opptil en time (eller de siste 5 min, 15 min eller timen) som én vanlig MP4, satt sammen på tvers av segmenter av MediaMTX uten omkoding.
- MP4- eller MPEG-TS-segmenter per strøm, gruppert per dag, med automatisk genererte miniatyrbilder.
- En innebygd spiller som folder seg ut på stedet, spolbar via HTTP Range-forespørsler.
- Nedlastinger som strømmer, med fremdrift i sanntid og avbryt.
- Trykk `/` for å filtrere.

### Økter

- **Alle tilkoblede, i én tabell.** Publiserere og lesere over RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC og HLS, med fjernadresse, byte inn og ut og oppetid, oppdatert hvert 5. sekund.
- **Kast ut en klient** etter en bekreftelse. Den kan koble til igjen; å kaste ut er ikke en utestengelse.

### Konfigurasjon uten YAML

- **Serverkonfigurasjonen:** 66 typede, validerte kontroller fordelt på Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC og SRT.
- **Path defaults og overstyringer per path**, på de scopene MediaMTX serverer dem fra. Å lagre en strøm dekket av et jokertegn skriver en tynn oppføring, så urørte nøkler fortsetter å følge standardverdiene.
- **En path-katalog** med merker for live og regex, et veiledet skjema for å «legge til et RTSP-kamera», og tilbakestill eller slett for hver paths egen oppføring (med en advarsel hvis noen er tilkoblet).
- **Direkte helsestatus på hver paths side:** spor, lesere, overførte byte, bilder med feil og oppetid, oppdatert hvert 5. sekund. En path der ingenting publiseres vises som inaktiv, ikke ødelagt.
- **Robusthet på hver path:** en alltid tilgjengelig reserve som spiller et offline-klipp i løkke mens kameraet er nede, og henting ved behov som bare åpner kilden mens noen ser på.
- **Hver `runOn*`-hook**, med en advarsel der lagring starter path-en på nytt.
- **Videresending:** send en path til YouTube, Twitch eller en annen server via MediaMTX sin innebygde `forward`-liste, med maskerte strømnøkler og uten omstart av path-en.
- **Tynne skriveoperasjoner.** Bare nøklene du endret blir sendt.

### Drift

Én prosess for API, SPA og medier · multiarkitektur · `GET /api/health` · MediaMTX-versjon i toppfeltet · strukturerte logger · kan installeres som PWA · mørkt og lyst · 30 språk · ingen database.

## Miljøvariabler

De sår første oppstart. Alt kan fortsatt endres under **Config**.

| Variabel | Standard i imaget | Hensikt |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hvor Connect når MediaMTX-API-et |
| `MEDIAMTX_API_PORT` | `9997` | Port for MediaMTX-API-et |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Hvor *nettleseren* når MediaMTX for avspilling. Sett den når nettleseren ikke kjører på serveren |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Hvor Connect leser opptak |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor stillbilder og miniatyrbilder havner |
| `DATA_DIR` | `/data` | Hvor `config.json` ligger |
| `PORT` | `3000` | HTTP-port |
| `LOG_LEVEL` | `info` | Loggnivå for Pino |

`http://mediamtx` slås bare opp i nettverket til den medfølgende compose-filen. For en frittstående `docker run` peker du den mot verten din. Med compose setter du `REMOTE_MEDIAMTX_HOST` i `.env` i stedet for `REMOTE_MEDIAMTX_URL`: den setter også WebRTC-verten som MediaMTX annonserer. [`.env.example`](../../.env.example) forklarer hver enkelt, og `pnpm dev` bruker localhost-standarder helt uten `.env`.

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

Direkteavspillingen går fra nettleseren til MediaMTX. Connect flytter JSON, pluss opptakene og miniatyrbildene: fra disk, eller innspilte strekk videresendt fra MediaMTX sin avspillingsserver.

## Dokumentasjon

| | |
|---|---|
| [Funksjoner](../../docs/FEATURES.md) | Hver leverte evne, rute og prosedyre |
| [Arkitektur](../../docs/ARCHITECTURE.md) | Hvordan delene henger sammen |
| [Bidra](../../CONTRIBUTING.md) | Utviklingsoppsett, skript, PR-prosess |
| [Eksempler](../../examples/) | Raspberry Pi-kamera, falske strømmer for testing |

## Bidra

Issues og PR-er er velkomne. `pnpm install && pnpm dev` gir deg hele stakken med testdata. Se [CONTRIBUTING.md](../../CONTRIBUTING.md), og merk at PR-titler er conventional commits. Vi følger en [oppførselskodeks](../../CODE_OF_CONDUCT.md).

## Lisens

[MIT](../../LICENSE)
