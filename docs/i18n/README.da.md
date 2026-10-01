<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webgrænsefladen til <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Se livestreams, gennemse optagelser og rediger din MediaMTX-konfiguration fra browseren.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — gitter med livestreams, optagelsesbrowser og konfigurationseditor" width="860">

<details>
<summary>🌍 Læs på 30 sprog</summary>
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
</details>

</div>

## Hvad det er

MediaMTX er en fremragende streamingserver uden grænseflade. Connect er den manglende frontend: én container, der taler med MediaMTX-API'et og gør det til en kameravæg, et optagelsesarkiv og en konfigurationseditor.

Det er en følgesvend, ikke en erstatning. Hvert skærmbillede svarer til noget, MediaMTX allerede blotlægger: en path, et API-endpoint, et `runOn*`-hook, en protokol den selv serverer. Ingen video gemmes, ingen medier videresendes, ingen database.

## Kom hurtigt i gang

Multiarkitektur-images (`linux/amd64`, `linux/arm64`); Docker henter den rigtige.

**Kører MediaMTX allerede?** Sæt Connect ved siden af:

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

**Starter du fra nul?** Den medfølgende compose bygger Connect og kører den ved siden af MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Åbn derefter <http://localhost:3000>.

> [!IMPORTANT]
> Connect kræver `api: yes` i din `mediamtx.yml`. Den [medfølgende konfiguration](../../mediamtx.yml) virker som den er.

## Hvad du får

### Livevisning

Hver eneste path, MediaMTX kender, i et gitter på 2–4 kolonner.

- **WebRTC eller HLS, kort for kort.** `AUTO` falder stille tilbage, `LOW-LAT` insisterer på WebRTC, `COMPAT` tvinger HLS igennem. Hvert kort melder den transport, det rent faktisk fik.
- **Stillbilleder i hvile.** Et baggrundsjob holder et friskt billede på hvert kort, med billedets alder på mærkatet. Brug for et nyt med det samme? Tag det fra kortets menu.
- **Live-telemetri.** Codecs, antal seere og oppetid, direkte fra path-listen.
- **Ærlig optagestatus.** Kortene viser, om en stream *faktisk* optager; en status, Connect ikke kunne læse, hedder ukendt, aldrig slukket.
- **Udgivelses-URL'er i udklipsholderen.** RTSP, RTMP og SRT, bygget ud fra serverens egne lytteadresser. Hver paths side går videre med et panel til udgivelse og læsning: hver protokol, serveren serverer, inklusive WHIP, WHEP, HLS og TLS-varianterne, med kodestumper klar til at kopiere for ffmpeg, GStreamer, OBS, ffplay og VLC.

### Optagelser

- En dagstidslinje pr. stream fra MediaMTX' afspilningsserver: optagede strækninger og hullerne imellem dem, hver især afspilbar. Hvis afspilning er slået fra, viser Connect præcis de konfigurationsændringer, der skal til, og anvender dem med ét klik.
- Download af klip: ethvert interval op til en time (eller de seneste 5 min, 15 min eller time) som én almindelig MP4, sat sammen på tværs af segmenter af MediaMTX uden omkodning.
- MP4- eller MPEG-TS-segmenter pr. stream, grupperet pr. dag, med automatisk genererede miniaturer.
- En indlejret afspiller, der folder sig ud på stedet, spolbar via HTTP Range-kald.
- Downloads, der streamer, med live fremdrift og annullering.
- Tryk `/` for at filtrere.

### Sessioner

- **Alle forbundne, i én tabel.** Udgivere og læsere over RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC og HLS, med fjernadresse, bytes ind og ud samt oppetid, opdateret hvert 5. sekund.
- **Smid en klient ud** efter en bekræftelse. Den kan forbinde igen; at smide ud er ikke en udelukkelse.

### Konfiguration uden YAML

- **Serverkonfigurationen:** 66 typede, validerede kontroller fordelt på Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC og SRT.
- **Path defaults og overrides pr. path**, i de scopes MediaMTX serverer dem fra. At gemme en stream dækket af et jokertegn skriver en tynd post, så urørte nøgler bliver ved med at følge standardværdierne.
- **Et path-katalog** med mærker for live og regex, en guidet formular til at »tilføje et RTSP-kamera« og gendan eller slet for enhver paths egen post (med en advarsel, hvis nogen er forbundet).
- **Live-tilstand på hver paths side:** spor, læsere, overførte bytes, fejlbehæftede billeder og oppetid, opdateret hvert 5. sekund. En path, hvor intet udgives, vises som inaktiv, ikke defekt.
- **Robusthed på hver path:** en altid tilgængelig reserve, der afspiller et offline-klip i løkke, mens kameraet er nede, og hentning efter behov, der kun åbner kilden, mens nogen ser med.
- **Hvert `runOn*`-hook**, med en advarsel der, hvor en gemning genstarter path'en.
- **Videresendelse:** send en path til YouTube, Twitch eller en anden server via MediaMTX' indbyggede `forward`-liste, med maskerede streamnøgler og uden genstart af path'en.
- **Tynde skrivninger.** Kun de nøgler, du har ændret, bliver sendt.

### Drift

Én proces til API, SPA og medier · multiarkitektur · `GET /api/health` · MediaMTX-version i sidehovedet · strukturerede logs · kan installeres som PWA · mørkt og lyst · 30 sprog · ingen database.

## Miljøvariabler

De sår den første opstart. Alt kan fortsat ændres under **Config**.

| Variabel | Standard i imaget | Formål |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hvor Connect når MediaMTX-API'et |
| `MEDIAMTX_API_PORT` | `9997` | Port til MediaMTX-API'et |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Hvor *browseren* når MediaMTX til afspilning. Sæt den, når browseren ikke kører på serveren |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Hvor Connect læser optagelser |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor stillbilleder og miniaturer havner |
| `DATA_DIR` | `/data` | Hvor `config.json` ligger |
| `PORT` | `3000` | HTTP-port |
| `LOG_LEVEL` | `info` | Logniveau for Pino |

`http://mediamtx` kan kun slås op i netværket for den medfølgende compose. Til en selvstændig `docker run` peger du den mod din vært. Med compose sætter du `REMOTE_MEDIAMTX_HOST` i `.env` i stedet for `REMOTE_MEDIAMTX_URL`: den sætter også den WebRTC-vært, MediaMTX annoncerer. [`.env.example`](../../.env.example) forklarer hver enkelt, og `pnpm dev` bruger localhost-standarder helt uden `.env`.

## Sådan virker det

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

Liveafspilningen går fra browseren til MediaMTX. Connect flytter JSON plus optagelserne og miniaturerne: fra disken, eller optagede strækninger videresendt fra MediaMTX' afspilningsserver.

## Dokumentation

| | |
|---|---|
| [Funktioner](../../docs/FEATURES.md) | Hver leveret evne, rute og procedure |
| [Arkitektur](../../docs/ARCHITECTURE.md) | Hvordan brikkerne passer sammen |
| [Bidrag](../../CONTRIBUTING.md) | Udviklingsopsætning, scripts, PR-proces |
| [Eksempler](../../examples/) | Raspberry Pi-kamera, falske streams til test |

## Bidrag

Issues og PR'er er velkomne. `pnpm install && pnpm dev` giver dig hele stakken med testdata. Se [CONTRIBUTING.md](../../CONTRIBUTING.md), og bemærk at PR-titler er conventional commits. Vi følger et [adfærdskodeks](../../CODE_OF_CONDUCT.md).

## Licens

[MIT](../../LICENSE)
