<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webgrænsefladen til <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Se livestreams, gennemse optagelser, rediger enhver konfigurationsnøgle — fra browseren.</p>

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

Det er en følgesvend, ikke en erstatning. Hvert skærmbillede hviler på noget, MediaMTX allerede blotlægger: en path, et API-endpoint, et `runOn*`-hook, en protokol den selv serverer. Ingen video gemmes, ingen medier videresendes, ingen database.

## Kom hurtigt i gang

Multiarkitektur-images (`linux/amd64`, `linux/arm64`) — Docker henter den rigtige.

**Kører MediaMTX allerede?** Sæt Connect ved siden af:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Starter du fra nul?** Den medfølgende compose starter begge:

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

Hver eneste path, MediaMTX kender, i et gitter på 2 til 4 kolonner.

- **WebRTC eller HLS, kort for kort.** `AUTO` falder stille tilbage til HLS, `LOW-LAT` insisterer på WebRTC, `COMPAT` tvinger HLS igennem — og hvert kort melder den transport, det rent faktisk fik.
- **Stillbilleder i hvile.** Et baggrundsjob holder et friskt billede på hvert kort, med billedets alder på mærkatet.
- **Live-telemetri.** Codecs, antal seere og oppetid, direkte fra path-listen.
- **Ærlig optagestatus.** Kortene viser, om en stream *faktisk* optager; en status, Connect ikke kunne læse, hedder ukendt, aldrig slukket.
- **Udgivelses-URL'er i udklipsholderen.** RTSP, RTMP og SRT, bygget ud fra serverens egne lytteadresser.

### Optagelser

- Hver streams MP4-filer, grupperet pr. dag, med automatiske miniaturer.
- En afspiller, der folder sig ud på stedet, spolbar via HTTP Range-kald.
- Downloads, der streamer, med live fremdrift og annullering.
- Tryk `/` for at filtrere.

### Konfiguration uden YAML

- **Hele serverkonfigurationen** — 65 typede, validerede kontroller fordelt på Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC og SRT.
- **Path defaults og overrides pr. path**, i de scopes MediaMTX serverer dem fra. At gemme en stream dækket af et jokertegn skriver en tynd post, så urørte nøgler bliver ved med at arve.
- **Alle 15 `runOn*`-hooks**, med en advarsel der, hvor en gemning genstarter path'en.
- **Tynde skrivninger** — kun de nøgler, du har ændret.

### Drift

Én proces til API, SPA og medier · multiarkitektur · `GET /health` · strukturerede logs · PWA · lyst og mørkt · 30 sprog · ingen database.

## Miljøvariabler

De sår kun den allerførste opstart. Resten kan ændres under **Config**.

| Variabel | Standard | Formål |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hvor Connect når MediaMTX-API'et indefra sin container |
| `MEDIAMTX_API_PORT` | `9997` | Port til MediaMTX-API'et |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Værtssti monteret til optagelser (kun compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hvor miniaturer havner |

`http://mediamtx` kan kun slås op i netværket for den medfølgende compose — til en selvstændig `docker run` peger du den mod din egen vært.

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

Afspilningen går fra browseren til MediaMTX. Connect flytter kun JSON plus de optagelser og miniaturer, den læser fra disken.

## Dokumentation

| | |
|---|---|
| [Funktioner](../FEATURES.md) | Hver leveret evne, rute og procedure |
| [Arkitektur](../../ARCHITECTURE.md) | Hvordan brikkerne passer sammen |
| [Bidrag](../../CONTRIBUTING.md) | Udviklingsopsætning, scripts, PR-proces |
| [Eksempler](../../examples/) | Raspberry Pi-kamera, falske streams til test |

## Bidrag

Issues og PR'er er velkomne. `pnpm install && pnpm dev` giver dig hele stakken med testdata — se [CONTRIBUTING.md](../../CONTRIBUTING.md), og bemærk at PR-titler er conventional commits. Vi følger et [adfærdskodeks](../../CODE_OF_CONDUCT.md).

## Licens

[MIT](../../LICENSE)
