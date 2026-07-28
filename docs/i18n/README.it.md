<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interfaccia web per <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Guarda le dirette, sfoglia le registrazioni e modifica qualsiasi chiave di configurazione — dal browser.</p>

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
  🇮🇹 <strong>Italiano</strong> •
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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — griglia delle dirette, archivio registrazioni ed editor di configurazione" width="860">

</div>

## Cos'è

MediaMTX è un ottimo server di streaming e non ha un'interfaccia. Connect è il front-end che gli manca: un container che parla con l'API di MediaMTX e la trasforma in un muro di telecamere, un archivio di registrazioni e un editor di configurazione.

È un compagno, non un sostituto. Ogni schermata poggia su qualcosa che MediaMTX già espone — un path, un endpoint dell'API, un hook `runOn*`, un protocollo che serve nativamente. Connect non archivia video, non fa da proxy ai media e non usa un database. Puntalo a un server attivo e funziona.

## Avvio rapido

Le immagini sono pubblicate per `linux/amd64` e `linux/arm64` (Raspberry Pi, Apple Silicon e simili), quindi Docker scarica quella giusta al posto tuo.

**MediaMTX è già in esecuzione?** Affianca Connect:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Parti da zero?** Il compose incluso avvia entrambi:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

In entrambi i casi, apri <http://localhost:3000>.

> [!IMPORTANT]
> Connect richiede `api: yes` nel tuo `mediamtx.yml` — è tramite quell'API che legge e scrive tutto. La [configurazione inclusa](../../mediamtx.yml) è un riferimento funzionante.

## Cosa ottieni

### Vista live

Una griglia con tutti i path noti a MediaMTX, su 2, 3 o 4 colonne.

- **WebRTC o HLS, per singola card.** `AUTO` preferisce WebRTC e ripiega su HLS senza dirlo, `LOW-LAT` pretende WebRTC, `COMPAT` impone HLS. Ogni card negozia la propria connessione e dichiara il trasporto che ha davvero ottenuto — mai quello che hai chiesto.
- **Istantanee anche da ferma.** Un job in background cattura un fotogramma da ogni stream, così le card spente mostrano comunque la scena, con l'età del fotogramma sulla pill. «Scatta istantanea» ne cattura una all'istante.
- **Telemetria dal vivo.** Chip dei codec, numero di spettatori e uptime, presi direttamente dalla lista dei path — senza richieste aggiuntive.
- **Stato di registrazione che dice la verità.** Le card mostrano se uno stream sta registrando *davvero* (il suo override fuso sopra i path defaults, come lo risolve MediaMTX), e uno stato illeggibile compare come sconosciuto anziché come spento.
- **URL di pubblicazione negli appunti.** Destinazioni RTSP, RTMP e SRT costruite dagli indirizzi di ascolto del server stesso, così una porta cambiata resta la porta giusta.

### Registrazioni

- Gli MP4 di ogni stream, raggruppati per giorno, dal più recente, con miniature generate automaticamente.
- Un player che si espande sul posto, con una vera barra di ricerca basata su richieste HTTP Range.
- Download in streaming con avanzamento dal vivo, velocità e pulsante di annullamento.
- Premi `/` ovunque per filtrare.

### Configurazione, senza YAML

- **Tutta la configurazione del server** — 65 controlli tra Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT, ognuno tipizzato, validato e documentato nella tua lingua.
- **Path defaults e override per singolo path**, sugli scope da cui MediaMTX li serve davvero. Salvare uno stream coperto da wildcard materializza una voce sparsa, così le chiavi non toccate continuano a seguire i default — e «ripristina ereditato» annulla tutto.
- **Tutti e 15 gli hook di path `runOn*`**, con un avviso dove salvarne uno riavvia il path.
- **Scritture sparse.** Connect invia in PATCH solo le chiavi che hai cambiato; quello che non espone resta intatto.

### Fatto per una scatola che puoi dimenticare

Un solo processo per API, SPA e media · immagini multi-arch · `GET /health` · log strutturati · PWA installabile · temi chiaro e scuro · 30 lingue · nessun database.

## Variabili d'ambiente

Tutto quanto è modificabile a runtime da **Config** — queste variabili servono solo al primo avvio.

| Variabile | Default | A cosa serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dove Connect raggiunge l'API di MediaMTX dall'*interno* del suo container |
| `MEDIAMTX_API_PORT` | `9997` | Porta dell'API di MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Percorso host montato per le registrazioni (solo compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dove vengono salvate le miniature generate |

Il default `http://mediamtx` si risolve solo sulla rete del compose incluso. Per un `docker run` autonomo, impostalo sul tuo host MediaMTX — oppure correggilo dopo da **Config**, senza riavviare.

## Come funziona

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

La riproduzione va dal browser direttamente a MediaMTX. Connect muove solo JSON, più le registrazioni e le miniature che legge da disco.

## Documentazione

| | |
|---|---|
| [Funzionalità](../FEATURES.md) | Ogni capacità, rotta e procedura rilasciata |
| [Architettura](../../ARCHITECTURE.md) | Come si incastrano i pezzi |
| [Contribuire](../../CONTRIBUTING.md) | Ambiente di sviluppo, script, processo di PR |
| [Esempi](../../examples/) | Telecamera Raspberry Pi, stream finti per i test |

## Contribuire

Issue e PR sono benvenute. `pnpm install && pnpm dev` ti dà lo stack completo con dati di esempio — vedi [CONTRIBUTING.md](../../CONTRIBUTING.md) per il resto, e nota che i titoli delle PR sono [conventional commits](../../CONTRIBUTING.md). Questo progetto segue un [Codice di Condotta](../../CODE_OF_CONDUCT.md).

## Licenza

[MIT](../../LICENSE)
