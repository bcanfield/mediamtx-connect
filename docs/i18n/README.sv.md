<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webbgränssnittet för <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Titta på direktsändningar, bläddra bland inspelningar, redigera vilken konfigurationsnyckel som helst — från webbläsaren.</p>

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

Det är en följeslagare, inte en ersättare. Varje vy vilar på något MediaMTX redan exponerar: en path, en API-endpoint, en `runOn*`-hook, ett protokoll den serverar av egen kraft. Ingen video lagras, inga medier proxas, ingen databas.

## Snabbstart

Multiarkitektur-avbildningar (`linux/amd64`, `linux/arm64`) — Docker hämtar rätt.

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

Öppna sedan <http://localhost:3000>.

> [!IMPORTANT]
> Connect behöver `api: yes` i din `mediamtx.yml`. Den [medföljande konfigurationen](../../mediamtx.yml) fungerar som den är.

## Vad du får

### Direktvy

Varje path MediaMTX känner till, i ett rutnät med 2 till 4 kolumner.

- **WebRTC eller HLS, per kort.** `AUTO` faller tyst tillbaka på HLS, `LOW-LAT` kräver WebRTC, `COMPAT` tvingar fram HLS — och varje kort rapporterar den transport det faktiskt fick.
- **Stillbilder även i vila.** Ett bakgrundsjobb håller en färsk bildruta på varje kort, med dess ålder på etiketten.
- **Live-telemetri.** Codecar, antal tittare och drifttid, direkt ur path-listan.
- **Ärlig inspelningsstatus.** Korten visar om en ström *faktiskt* spelar in; en status Connect inte kunde läsa kallas okänd, aldrig av.
- **Publiceringsadresser till urklipp.** RTSP, RTMP och SRT, byggda av serverns egna lyssnaradresser.

### Inspelningar

- Varje ströms MP4-filer, grupperade per dag, med automatiska miniatyrer.
- En spelare som fälls ut på plats, spolbar via HTTP Range-anrop.
- Nedladdningar som strömmar, med förlopp i realtid och avbryt.
- Tryck `/` för att filtrera.

### Konfiguration, utan YAML

- **Hela serverkonfigurationen** — 65 typade, validerade kontroller över Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC och SRT.
- **Path defaults och overrides per path**, på de scope MediaMTX serverar dem från. Att spara en ström som täcks av ett jokertecken skriver en gles post, så orörda nycklar fortsätter ärva.
- **Alla 15 `runOn*`-hooks**, med varning där ett sparande startar om path:en.
- **Glesa skrivningar** — bara de nycklar du ändrat.

### Drift

En process för API, SPA och media · multiarkitektur · `GET /health` · strukturerade loggar · PWA · ljust och mörkt · 30 språk · ingen databas.

## Miljövariabler

De sår bara den allra första starten. Resten går att ändra i **Config**.

| Variabel | Standard | Syfte |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Var Connect når MediaMTX API inifrån sin container |
| `MEDIAMTX_API_PORT` | `9997` | Port för MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Värdsökväg som monteras för inspelningar (endast compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Var miniatyrer hamnar |

`http://mediamtx` går bara att slå upp i nätverket för den medföljande compose-filen — för en fristående `docker run`, peka den mot din värd.

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

Uppspelningen går från webbläsaren till MediaMTX. Connect flyttar bara JSON, plus inspelningarna och miniatyrerna den läser från disk.

## Dokumentation

| | |
|---|---|
| [Funktioner](../FEATURES.md) | Varje levererad förmåga, rutt och procedur |
| [Arkitektur](../../ARCHITECTURE.md) | Hur delarna hänger ihop |
| [Bidra](../../CONTRIBUTING.md) | Utvecklingsmiljö, skript, PR-process |
| [Exempel](../../examples/) | Raspberry Pi-kamera, fejkade strömmar för test |

## Bidra

Issues och PR:er är välkomna. `pnpm install && pnpm dev` ger dig hela stacken med testdata — se [CONTRIBUTING.md](../../CONTRIBUTING.md), och notera att PR-titlar är conventional commits. Vi följer en [uppförandekod](../../CODE_OF_CONDUCT.md).

## Licens

[MIT](../../LICENSE)
