<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interfaccia web per <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Guarda le dirette, sfoglia le registrazioni e modifica la configurazione di MediaMTX dal browser.</p>

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

È un compagno, non un sostituto. Ogni schermata poggia su qualcosa che MediaMTX già espone: un path, un endpoint dell'API, un hook `runOn*`, un protocollo che serve nativamente. Nessun video archiviato, nessun media in proxy, nessun database.

## Avvio rapido

Immagini multi-arch (`linux/amd64`, `linux/arm64`); Docker scarica quella giusta.

**MediaMTX è già attivo?** Affianca Connect:

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

**Parti da zero?** Il compose incluso compila Connect e lo avvia accanto a MediaMTX:

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

- **WebRTC o HLS, per singola card.** `AUTO` ripiega senza dirlo, `LOW-LAT` pretende WebRTC, `COMPAT` impone HLS. Ogni card dichiara il trasporto che ha davvero ottenuto.
- **Istantanee anche da ferma.** Un job in background tiene un fotogramma recente su ogni card, con la sua età sulla pill. Ne serve una nuova subito? Scattala dal menu della card.
- **Telemetria dal vivo.** Codec, spettatori e uptime, direttamente dalla lista dei path.
- **Stato di registrazione onesto.** Le card mostrano se uno stream sta registrando *davvero*; uno stato che Connect non ha potuto leggere dice sconosciuto, mai spento.
- **URL di pubblicazione negli appunti.** RTSP, RTMP e SRT, costruiti dagli indirizzi di ascolto del server stesso. La pagina di ogni path va oltre con un pannello di pubblicazione e lettura: tutti i protocolli serviti dal server, inclusi WHIP, WHEP, HLS e le varianti TLS, con snippet pronti da copiare per ffmpeg, GStreamer, OBS, ffplay e VLC.

### Registrazioni

- Una timeline giornaliera per stream dal server di playback di MediaMTX: gli intervalli registrati e i vuoti tra di essi, ciascuno riproducibile. Se il playback è disattivato, Connect elenca le modifiche di configurazione esatte che servono e le applica con un clic.
- Download di clip: qualsiasi intervallo fino a un'ora (o gli ultimi 5 min, 15 min o un'ora) come un unico MP4 semplice, cucito tra i segmenti da MediaMTX senza ricodifica.
- Segmenti MP4 o MPEG-TS di ogni stream, raggruppati per giorno, con miniature generate automaticamente.
- Un player integrato che si espande sul posto, navigabile via richieste HTTP Range.
- Download in streaming, con avanzamento dal vivo e annullamento.
- Premi `/` per filtrare.

### Sessioni

- **Tutti i connessi, in una tabella.** Publisher e lettori su RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC e HLS, con indirizzo remoto, byte in entrata e in uscita e uptime, aggiornati ogni 5 secondi.
- **Espelli un client** dopo una conferma. Può riconnettersi; un'espulsione non è un ban.

### Configurazione, senza YAML

- **La configurazione del server:** 66 controlli tipizzati e validati tra Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC e SRT.
- **Path defaults e override per path**, sugli scope da cui MediaMTX li serve. Salvare uno stream coperto da wildcard scrive una voce sparsa, così le chiavi non toccate continuano a seguire i default.
- **Un catalogo dei path** con badge live e regex, un modulo guidato "aggiungi una telecamera RTSP" e la possibilità di ripristinare o eliminare la voce propria di qualsiasi path (con un avviso se qualcuno è connesso).
- **Salute in tempo reale nella pagina di ogni path:** tracce, lettori, byte trasferiti, fotogrammi in errore e uptime, aggiornati ogni 5 secondi. Un path su cui nessuno pubblica risulta inattivo, non guasto.
- **Resilienza su ogni path:** un fallback sempre disponibile che riproduce in loop una clip offline mentre la telecamera è giù, e un pull on demand che apre la sorgente solo mentre qualcuno guarda.
- **Ogni hook `runOn*`**, con un avviso dove salvare riavvia il path.
- **Inoltro:** invia un path a YouTube, Twitch o a un altro server tramite la lista nativa `forward` di MediaMTX, con le stream key mascherate e senza riavviare il path.
- **Scritture sparse.** Vengono inviate solo le chiavi che hai cambiato.

### Esercizio

Un solo processo per API, SPA e media · multi-arch · `GET /api/health` · versione di MediaMTX nell'intestazione · log strutturati · installabile come PWA · chiaro e scuro · 30 lingue · nessun database.

## Variabili d'ambiente

Servono solo al primo avvio. Tutto resta modificabile da **Config**.

| Variabile | Default nell'immagine | A cosa serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dove Connect raggiunge l'API di MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Porta dell'API di MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Dove il *browser* raggiunge MediaMTX per la riproduzione. Impostala ogni volta che il browser non è sul server |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Dove Connect legge le registrazioni |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dove vengono salvate istantanee e miniature |
| `DATA_DIR` | `/data` | Dove si trova `config.json` |
| `PORT` | `3000` | Porta HTTP |
| `LOG_LEVEL` | `info` | Livello di log di Pino |

`http://mediamtx` si risolve solo sulla rete del compose incluso. Per un `docker run` autonomo, puntalo al tuo host. Con compose, imposta `REMOTE_MEDIAMTX_HOST` in `.env` invece di `REMOTE_MEDIAMTX_URL`: imposta anche l'host WebRTC che MediaMTX annuncia. [`.env.example`](../../.env.example) spiega ciascuna variabile, e `pnpm dev` usa i default di localhost senza alcun `.env`.

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

La riproduzione live va dal browser a MediaMTX. Connect muove JSON, più le registrazioni e le miniature: da disco, oppure intervalli registrati passati in proxy dal server di playback di MediaMTX.

## Documentazione

| | |
|---|---|
| [Funzionalità](../../docs/FEATURES.md) | Ogni capacità, rotta e procedura rilasciata |
| [Architettura](../../docs/ARCHITECTURE.md) | Come si incastrano i pezzi |
| [Contribuire](../../CONTRIBUTING.md) | Ambiente di sviluppo, script, processo di PR |
| [Esempi](../../examples/) | Telecamera Raspberry Pi, stream finti per i test |

## Contribuire

Issue e PR sono benvenute. `pnpm install && pnpm dev` ti dà lo stack completo con dati di esempio. Vedi [CONTRIBUTING.md](../../CONTRIBUTING.md), e nota che i titoli delle PR sono conventional commits. Seguiamo un [Codice di Condotta](../../CODE_OF_CONDUCT.md).

## Licenza

[MIT](../../LICENSE)
