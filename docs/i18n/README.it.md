<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interfaccia web per <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Guarda le dirette, sfoglia le registrazioni, modifica qualsiasi chiave di configurazione — dal browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — griglia delle dirette, archivio registrazioni ed editor di configurazione" width="860">

<details>
<summary>🌍 Leggilo in 30 lingue</summary>
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
</details>

</div>

## Cos'è

MediaMTX è un ottimo server di streaming senza interfaccia. Connect è il front-end che gli manca: un container che parla con l'API di MediaMTX e la trasforma in un muro di telecamere, un archivio di registrazioni e un editor di configurazione.

È un compagno, non un sostituto. Ogni schermata poggia su qualcosa che MediaMTX già espone: un path, un endpoint, un hook `runOn*`, un protocollo che serve nativamente. Nessun video archiviato, nessun media in proxy, nessun database.

## Avvio rapido

Immagini multi-arch (`linux/amd64`, `linux/arm64`) — Docker scarica quella giusta.

**MediaMTX è già attivo?** Affianca Connect:

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

Poi apri <http://localhost:3000>.

> [!IMPORTANT]
> Connect richiede `api: yes` nel tuo `mediamtx.yml`. La [configurazione inclusa](../../mediamtx.yml) funziona così com'è.

## Cosa ottieni

### Vista live

Tutti i path noti a MediaMTX, in una griglia da 2 a 4 colonne.

- **WebRTC o HLS, per singola card.** `AUTO` ripiega su HLS senza dirlo, `LOW-LAT` pretende WebRTC, `COMPAT` impone HLS — e ogni card dichiara il trasporto che ha davvero ottenuto.
- **Istantanee anche da ferma.** Un job in background tiene un fotogramma recente su ogni card, con la sua età sulla pill.
- **Telemetria dal vivo.** Codec, spettatori e uptime, direttamente dalla lista dei path.
- **Stato di registrazione onesto.** Le card mostrano se uno stream sta registrando *davvero*; uno stato che Connect non ha potuto leggere dice sconosciuto, mai spento.
- **URL di pubblicazione negli appunti.** RTSP, RTMP e SRT, costruiti dagli indirizzi di ascolto del server stesso.

### Registrazioni

- Gli MP4 di ogni stream, raggruppati per giorno, con miniature automatiche.
- Un player che si espande sul posto, navigabile via richieste HTTP Range.
- Download in streaming, con avanzamento dal vivo e annullamento.
- Premi `/` per filtrare.

### Configurazione, senza YAML

- **Tutta la configurazione del server** — 65 controlli tipizzati e validati tra Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT.
- **Path defaults e override per path**, sugli scope da cui MediaMTX li serve. Salvare uno stream coperto da wildcard scrive una voce sparsa, così le chiavi non toccate continuano a ereditare.
- **Tutti e 15 gli hook `runOn*`**, con un avviso dove salvare riavvia il path.
- **Scritture sparse** — solo le chiavi che hai cambiato.

### Esercizio

Un solo processo per API, SPA e media · multi-arch · `GET /health` · log strutturati · PWA · chiaro e scuro · 30 lingue · nessun database.

## Variabili d'ambiente

Servono solo al primo avvio. Tutto resta modificabile da **Config**.

| Variabile | Default | A cosa serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dove Connect raggiunge l'API di MediaMTX dall'interno del suo container |
| `MEDIAMTX_API_PORT` | `9997` | Porta dell'API di MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Percorso host montato per le registrazioni (solo compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dove vengono salvate le miniature |

`http://mediamtx` si risolve solo sulla rete del compose incluso — per un `docker run` autonomo, puntalo al tuo host.

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

La riproduzione va dal browser a MediaMTX. Connect muove solo JSON, più le registrazioni e le miniature che legge da disco.

## Documentazione

| | |
|---|---|
| [Funzionalità](../FEATURES.md) | Ogni capacità, rotta e procedura rilasciata |
| [Architettura](../../ARCHITECTURE.md) | Come si incastrano i pezzi |
| [Contribuire](../../CONTRIBUTING.md) | Ambiente di sviluppo, script, processo di PR |
| [Esempi](../../examples/) | Telecamera Raspberry Pi, stream finti per i test |

## Contribuire

Issue e PR sono benvenute. `pnpm install && pnpm dev` ti dà lo stack completo con dati di esempio — vedi [CONTRIBUTING.md](../../CONTRIBUTING.md), e nota che i titoli delle PR sono conventional commits. Seguiamo un [Codice di Condotta](../../CODE_OF_CONDUCT.md).

## Licenza

[MIT](../../LICENSE)
