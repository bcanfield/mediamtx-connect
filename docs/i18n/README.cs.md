<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webové rozhraní pro <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Sledujte živé streamy, procházejte nahrávky a upravte libovolný konfigurační klíč — přímo v prohlížeči.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — mřížka živých streamů, prohlížeč nahrávek a editor konfigurace" width="860">

</div>

## Co to je

MediaMTX je vynikající streamovací server a přichází bez rozhraní. Connect je chybějící front-end: jeden kontejner, který mluví s API MediaMTX a promění ho v kamerovou stěnu, archiv nahrávek a editor konfigurace.

Je to společník, ne náhrada. Každá obrazovka stojí na něčem, co MediaMTX už vystavuje — na path, endpointu API, hooku `runOn*`, protokolu, který nativně obsluhuje. Connect neukládá video, nepřeposílá média a nemá databázi. Namiřte ho na běžící server a funguje.

## Rychlý start

Image vycházejí pro `linux/amd64` i `linux/arm64` (Raspberry Pi, Apple Silicon a spol.), takže Docker stáhne tu správnou za vás.

**MediaMTX už běží?** Postavte Connect vedle něj:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Začínáte od nuly?** Přiložený compose zvedne oba:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Tak či tak otevřete <http://localhost:3000>.

> [!IMPORTANT]
> Connect potřebuje ve vašem `mediamtx.yml` hodnotu `api: yes` — přes to API čte i zapisuje všechno. [Přiložená konfigurace](../../mediamtx.yml) je funkční vzor.

## Co dostanete

### Živý pohled

Mřížka všech path, které MediaMTX zná, ve 2, 3 nebo 4 sloupcích.

- **WebRTC nebo HLS, pro každou kartu zvlášť.** `AUTO` upřednostní WebRTC a tiše spadne na HLS, `LOW-LAT` trvá na WebRTC a `COMPAT` vynutí HLS. Každá karta si vyjedná vlastní spojení a hlásí transport, který opravdu dostala — nikdy ten vyžádaný.
- **Snímky i v nečinnosti.** Úloha na pozadí sebere z každého streamu snímek, takže i nehrající karty ukazují scénu a na štítku je stáří snímku. «Pořídit snímek» ho vezme okamžitě.
- **Živá telemetrie.** Štítky kodeků, počet diváků a doba běhu, rovnou ze seznamu path — bez dalších požadavků.
- **Stav nahrávání, který mluví pravdu.** Karty ukazují, jestli stream *skutečně* nahrává (jeho vlastní override složený přes path defaults, přesně jak to řeší MediaMTX); stav, který se nepodařilo přečíst, se zobrazí jako neznámý, ne jako vypnutý.
- **Publikační adresy do schránky.** Cíle RTSP, RTMP a SRT se skládají z vlastních naslouchacích adres serveru, takže změněný port zůstává tím správným portem.

### Nahrávky

- MP4 každého streamu, seskupené po dnech, od nejnovějších, s automaticky generovanými náhledy.
- Přehrávač, který se rozbalí na místě, s opravdovou posuvnou lištou postavenou na HTTP Range požadavcích.
- Streamované stahování s živým průběhem, rychlostí a tlačítkem pro zrušení.
- Kdekoli stiskněte `/` a filtrujte.

### Konfigurace bez YAML

- **Celá konfigurace serveru** — 65 ovládacích prvků napříč sekcemi Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC a SRT, každý typovaný, validovaný a popsaný ve vašem jazyce.
- **Path defaults a overridy pro jednotlivé path**, v rozsazích, ze kterých je MediaMTX skutečně obsluhuje. Uložení streamu krytého zástupným znakem vytvoří řídký záznam, takže nedotčené klíče dál sledují výchozí hodnoty — a «vrátit na zděděné» to zruší.
- **Všech 15 path hooků `runOn*`**, s varováním tam, kde uložení restartuje path.
- **Řídké zápisy.** Connect posílá PATCH jen se změněnými klíči; co nevystavuje, nechává být.

### Pro krabičku, na kterou zapomenete

Jediný proces obsluhuje API, SPA i média · multiarchitekturní image · `GET /health` · strukturované logy · instalovatelná PWA · světlý i tmavý motiv · 30 jazyků · žádná databáze.

## Proměnné prostředí

Všechno níže lze měnit za běhu v **Config** — tyto proměnné jen naplní první start.

| Proměnná | Výchozí | K čemu je |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Kde Connect dosáhne na API MediaMTX *zevnitř* svého kontejneru |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Cesta na hostiteli připojená pro nahrávky (jen compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kam se ukládají vygenerované náhledy |

Výchozí `http://mediamtx` se přeloží jen v síti přiloženého compose. Pro samostatný `docker run` nastavte vlastního hostitele MediaMTX — nebo to opravte později v **Config**, restart není potřeba.

## Jak to funguje

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

Přehrávání jde z prohlížeče přímo do MediaMTX. Connect přenáší jen JSON a k tomu nahrávky a náhledy, které čte z disku.

## Dokumentace

| | |
|---|---|
| [Funkce](../FEATURES.md) | Každá vydaná schopnost, routa a procedura |
| [Architektura](../../ARCHITECTURE.md) | Jak do sebe díly zapadají |
| [Přispívání](../../CONTRIBUTING.md) | Vývojové prostředí, skripty, proces PR |
| [Příklady](../../examples/) | Kamera Raspberry Pi, falešné streamy pro testy |

## Přispívání

Issues a PR jsou vítány. `pnpm install && pnpm dev` vám postaví celý stack i s testovacími daty — zbytek najdete v [CONTRIBUTING.md](../../CONTRIBUTING.md) a nezapomeňte, že názvy PR jsou [conventional commits](../../CONTRIBUTING.md). Projekt se řídí [Kodexem chování](../../CODE_OF_CONDUCT.md).

## Licence

[MIT](../../LICENSE)
