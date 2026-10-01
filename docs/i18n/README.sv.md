<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webbgränssnittet för <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Titta på direktsändningar, bläddra bland inspelningar och redigera din MediaMTX-konfiguration från webbläsaren.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — rutnät med direktsändningar, inspelningsbläddrare och konfigurationsredigerare" width="860">

<details>
<summary>🌍 Läs på 30 språk</summary>
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
</details>

</div>

## Vad det är

MediaMTX är en utmärkt streamingserver utan gränssnitt. Connect är den saknade frontenden: en container som pratar med MediaMTX API och gör om det till en kameravägg, ett inspelningsarkiv och en konfigurationsredigerare.

Det är en följeslagare, inte en ersättare. Varje vy motsvarar något MediaMTX redan exponerar: en path, en API-endpoint, en `runOn*`-hook, ett protokoll den serverar av egen kraft. Ingen video lagras, inga medier proxas, ingen databas.

## Snabbstart

Multiarkitektur-avbildningar (`linux/amd64`, `linux/arm64`); Docker hämtar rätt.

**Kör du redan MediaMTX?** Ställ Connect bredvid:

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

**Börjar du från noll?** Den medföljande compose-filen bygger Connect och kör den bredvid MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Öppna sedan <http://localhost:3000>.

> [!IMPORTANT]
> Connect behöver `api: yes` i din `mediamtx.yml`. Den [medföljande konfigurationen](../../mediamtx.yml) fungerar som den är.

## Vad du får

### Direktvy

Varje path MediaMTX känner till, i ett rutnät med 2–4 kolumner.

- **WebRTC eller HLS, per kort.** `AUTO` faller tyst tillbaka, `LOW-LAT` kräver WebRTC, `COMPAT` tvingar fram HLS. Varje kort rapporterar den transport det faktiskt fick.
- **Stillbilder även i vila.** Ett bakgrundsjobb håller en färsk bildruta på varje kort, med dess ålder på etiketten. Behöver du en ny direkt? Ta den från kortets meny.
- **Live-telemetri.** Codecar, antal tittare och drifttid, direkt ur path-listan.
- **Ärlig inspelningsstatus.** Korten visar om en ström *faktiskt* spelar in; en status Connect inte kunde läsa kallas okänd, aldrig av.
- **Publiceringsadresser till urklipp.** RTSP, RTMP och SRT, byggda av serverns egna lyssnaradresser. Varje paths sida går längre med en panel för publicering och läsning: alla protokoll servern serverar, inklusive WHIP, WHEP, HLS och TLS-varianterna, med färdiga kodsnuttar att kopiera för ffmpeg, GStreamer, OBS, ffplay och VLC.

### Inspelningar

- En dagstidslinje per ström från MediaMTX uppspelningsserver: inspelade avsnitt och luckorna mellan dem, alla spelbara. Om uppspelningen är avstängd listar Connect exakt vilka konfigurationsändringar som behövs och tillämpar dem med ett klick.
- Klippnedladdning: valfritt intervall upp till en timme (eller de senaste 5 min, 15 min eller timmen) som en enda vanlig MP4, ihopfogad över segment av MediaMTX utan omkodning.
- MP4- eller MPEG-TS-segment per ström, grupperade per dag, med automatiskt genererade miniatyrer.
- En inbäddad spelare som fälls ut på plats, spolbar via HTTP Range-anrop.
- Nedladdningar som strömmar, med förlopp i realtid och avbryt.
- Tryck `/` för att filtrera.

### Sessioner

- **Alla anslutna, i en tabell.** Publicerare och läsare över RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC och HLS, med fjärradress, inkommande och utgående byte samt drifttid, uppdaterat var 5:e sekund.
- **Sparka ut en klient** efter en bekräftelse. Den kan ansluta igen; en utsparkning är ingen avstängning.

### Konfiguration, utan YAML

- **Serverkonfigurationen:** 66 typade, validerade kontroller över Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC och SRT.
- **Path defaults och overrides per path**, på de scope MediaMTX serverar dem från. Att spara en ström som täcks av ett jokertecken skriver en gles post, så orörda nycklar fortsätter följa standardvärdena.
- **En path-katalog** med märken för live och regex, ett guidat formulär för att ”lägga till en RTSP-kamera”, och återställ eller ta bort för varje paths egen post (med varning om någon är ansluten).
- **Live-hälsa på varje paths sida:** spår, läsare, överförda byte, felaktiga bildrutor och drifttid, uppdaterat var 5:e sekund. En path där inget publiceras visas som vilande, inte trasig.
- **Motståndskraft på varje path:** en alltid tillgänglig reserv som loopar ett offline-klipp medan kameran ligger nere, och hämtning vid behov som bara öppnar källan medan någon tittar.
- **Varje `runOn*`-hook**, med varning där ett sparande startar om path:en.
- **Vidarebefordran:** skicka en path till YouTube, Twitch eller en annan server via MediaMTX inbyggda `forward`-lista, med maskerade strömnycklar och utan omstart av path:en.
- **Glesa skrivningar.** Bara de nycklar du ändrat skickas.

### Drift

En process för API, SPA och media · multiarkitektur · `GET /api/health` · MediaMTX-version i sidhuvudet · strukturerade loggar · installerbar som PWA · mörkt och ljust · 30 språk · ingen databas.

## Miljövariabler

De sår den första starten. Allt går fortsatt att ändra i **Config**.

| Variabel | Standard i avbildningen | Syfte |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Var Connect når MediaMTX API |
| `MEDIAMTX_API_PORT` | `9997` | Port för MediaMTX API |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Var *webbläsaren* når MediaMTX för uppspelning. Ange den så fort webbläsaren inte körs på servern |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Var Connect läser inspelningar |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Var stillbilder och miniatyrer hamnar |
| `DATA_DIR` | `/data` | Var `config.json` ligger |
| `PORT` | `3000` | HTTP-port |
| `LOG_LEVEL` | `info` | Loggnivå för Pino |

`http://mediamtx` går bara att slå upp i nätverket för den medföljande compose-filen. För en fristående `docker run`, peka den mot din värd. Med compose anger du `REMOTE_MEDIAMTX_HOST` i `.env` i stället för `REMOTE_MEDIAMTX_URL`: den sätter också den WebRTC-värd som MediaMTX annonserar. [`.env.example`](../../.env.example) förklarar var och en, och `pnpm dev` använder localhost-standardvärden helt utan `.env`.

## Så fungerar det

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

Direktuppspelningen går från webbläsaren till MediaMTX. Connect flyttar JSON, plus inspelningarna och miniatyrerna: från disk, eller inspelade avsnitt proxade från MediaMTX uppspelningsserver.

## Dokumentation

| | |
|---|---|
| [Funktioner](../../docs/FEATURES.md) | Varje levererad förmåga, rutt och procedur |
| [Arkitektur](../../docs/ARCHITECTURE.md) | Hur delarna hänger ihop |
| [Bidra](../../CONTRIBUTING.md) | Utvecklingsmiljö, skript, PR-process |
| [Exempel](../../examples/) | Raspberry Pi-kamera, fejkade strömmar för test |

## Bidra

Issues och PR:er är välkomna. `pnpm install && pnpm dev` ger dig hela stacken med testdata. Se [CONTRIBUTING.md](../../CONTRIBUTING.md), och notera att PR-titlar är conventional commits. Vi följer en [uppförandekod](../../CODE_OF_CONDUCT.md).

## Licens

[MIT](../../LICENSE)
