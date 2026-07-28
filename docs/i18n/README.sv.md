<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webbgränssnittet för <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Titta på direktsändningar, bläddra bland inspelningar och redigera vilken konfigurationsnyckel som helst — från webbläsaren.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — rutnät med direktsändningar, inspelningsbläddrare och konfigurationsredigerare" width="860">

</div>

## Vad det är

MediaMTX är en utmärkt streamingserver, och den kommer utan gränssnitt. Connect är den saknade frontenden: en container som pratar med MediaMTX API och gör om det till en kameravägg, ett inspelningsarkiv och en konfigurationsredigerare.

Det är en följeslagare, inte en ersättare. Varje vy vilar på något MediaMTX redan exponerar — en path, en API-endpoint, en `runOn*`-hook, ett protokoll den serverar av egen kraft. Connect lagrar ingen video, proxar inga medier och har ingen databas. Peka den mot en server som kör, så fungerar det.

## Snabbstart

Avbildningar publiceras för `linux/amd64` och `linux/arm64` (Raspberry Pi, Apple Silicon med flera), så Docker hämtar rätt åt dig.

**Kör du redan MediaMTX?** Ställ Connect bredvid:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Börjar du från noll?** Den medföljande compose-filen startar båda:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Hur du än gör: öppna <http://localhost:3000>.

> [!IMPORTANT]
> Connect behöver `api: yes` i din `mediamtx.yml` — det är genom det API:et allt läses och skrivs. Den [medföljande konfigurationen](../../mediamtx.yml) är en fungerande förlaga.

## Vad du får

### Direktvy

Ett rutnät över varje path MediaMTX känner till, i 2, 3 eller 4 kolumner.

- **WebRTC eller HLS, per kort.** `AUTO` föredrar WebRTC och faller tyst tillbaka på HLS, `LOW-LAT` kräver WebRTC och `COMPAT` tvingar fram HLS. Varje kort förhandlar sin egen anslutning och rapporterar den transport det faktiskt fick — aldrig den du bad om.
- **Stillbilder även i vila.** Ett bakgrundsjobb hämtar en bildruta från varje ström, så vilande kort visar ändå scenen, med bildrutans ålder på etiketten. «Ta stillbild» hämtar en direkt.
- **Live-telemetri.** Codec-etiketter, antal tittare och drifttid, direkt ur path-listan — utan extra anrop.
- **Inspelningsstatus som talar sanning.** Korten visar om en ström *faktiskt* spelar in (dess egen override lagd ovanpå path defaults, precis som MediaMTX löser upp det); en status som inte gick att läsa visas som okänd i stället för som av.
- **Publiceringsadresser till urklipp.** RTSP-, RTMP- och SRT-mål byggda av serverns egna lyssnaradresser, så en ändrad port är fortfarande rätt port.

### Inspelningar

- Varje ströms MP4-filer, grupperade per dag, nyast först, med automatiskt genererade miniatyrer.
- En spelare som fälls ut på plats, med en riktig sökrad byggd på HTTP Range-anrop.
- Nedladdningar som strömmar, med förlopp i realtid, hastighet och avbryt-knapp.
- Tryck `/` var som helst för att filtrera.

### Konfiguration, utan YAML

- **Hela serverkonfigurationen** — 65 kontroller över Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC och SRT, var och en typad, validerad och dokumenterad på ditt språk.
- **Path defaults och overrides per path**, på de scope MediaMTX faktiskt serverar dem från. Att spara en ström som täcks av ett jokertecken materialiserar en gles post, så orörda nycklar följer fortfarande standardvärdena — och «återgå till ärvt» ångrar det.
- **Alla 15 `runOn*`-path-hooks**, med varning där ett sparande startar om path:en.
- **Glesa skrivningar.** Connect PATCH:ar bara de nycklar du ändrat; det den inte visar lämnas ifred.

### Byggt för en låda man glömmer bort

En enda process serverar API, SPA och media · multiarkitektur-avbildningar · `GET /health` · strukturerade loggar · installerbar PWA · ljust och mörkt tema · 30 språk · ingen databas.

## Miljövariabler

Allt här går att ändra under drift i **Config** — variablerna sår bara den allra första starten.

| Variabel | Standard | Syfte |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Var Connect når MediaMTX API *inifrån* sin container |
| `MEDIAMTX_API_PORT` | `9997` | Port för MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Värdsökväg som monteras för inspelningar (endast compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Var genererade miniatyrer hamnar |

Standardvärdet `http://mediamtx` går bara att slå upp i nätverket för den medföljande compose-filen. För en fristående `docker run`, peka den mot din MediaMTX-värd — eller rätta till det senare i **Config**, utan omstart.

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

Uppspelningen går direkt från webbläsaren till MediaMTX. Connect flyttar bara JSON, plus inspelningarna och miniatyrerna den läser från disk.

## Dokumentation

| | |
|---|---|
| [Funktioner](../FEATURES.md) | Varje levererad förmåga, rutt och procedur |
| [Arkitektur](../../ARCHITECTURE.md) | Hur delarna hänger ihop |
| [Bidra](../../CONTRIBUTING.md) | Utvecklingsmiljö, skript, PR-process |
| [Exempel](../../examples/) | Raspberry Pi-kamera, fejkade strömmar för test |

## Bidra

Issues och PR:er är välkomna. `pnpm install && pnpm dev` ger dig hela stacken med testdata — se [CONTRIBUTING.md](../../CONTRIBUTING.md) för resten, och notera att PR-titlar är [conventional commits](../../CONTRIBUTING.md). Projektet följer en [uppförandekod](../../CODE_OF_CONDUCT.md).

## Licens

[MIT](../../LICENSE)
