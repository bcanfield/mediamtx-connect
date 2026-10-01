<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Interfața web pentru <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Urmărește transmisiuni live, răsfoiește înregistrări și editează configurația MediaMTX din browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grilă de transmisiuni live, browser de înregistrări și editor de configurare" width="860">

<details>
<summary>🌍 Citește în 30 de limbi</summary>
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
  🇷🇴 <strong>Română</strong> •
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

## Ce este

MediaMTX este un server de streaming excelent, fără interfață. Connect este front-end-ul care îi lipsește: un container care vorbește cu API-ul MediaMTX și îl transformă într-un perete de camere, o arhivă de înregistrări și un editor de configurare.

Este un însoțitor, nu un înlocuitor. Fiecare ecran corespunde unui lucru pe care MediaMTX îl expune deja: un path, un endpoint de API, un hook `runOn*`, un protocol pe care îl servește nativ. Nu stochează video, nu face proxy pentru media, nu ține bază de date.

## Pornire rapidă

Imagini multi-arhitectură (`linux/amd64`, `linux/arm64`); Docker o descarcă pe cea potrivită.

**Ai deja MediaMTX pornit?** Pune Connect lângă el:

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

**Pornești de la zero?** Fișierul compose inclus construiește Connect și îl rulează lângă MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Apoi deschide <http://localhost:3000>.

> [!IMPORTANT]
> Connect are nevoie de `api: yes` în `mediamtx.yml`. [Configurația inclusă](../../mediamtx.yml) funcționează ca atare.

## Ce primești

### Vizualizare live

Fiecare path pe care îl cunoaște MediaMTX, într-o grilă de 2–4 coloane.

- **WebRTC sau HLS, de la card la card.** `AUTO` revine în tăcere la varianta de rezervă, `LOW-LAT` insistă pe WebRTC, `COMPAT` impune HLS. Fiecare card raportează transportul obținut efectiv.
- **Instantanee și când stă.** O sarcină de fundal ține pe fiecare card un cadru recent, cu vechimea lui pe etichetă. Ai nevoie de unul proaspăt chiar acum? Fă-l din meniul cardului.
- **Telemetrie live.** Codecuri, spectatori și timp de funcționare, direct din lista de path.
- **Stare de înregistrare cinstită.** Cardurile arată dacă un flux înregistrează *efectiv*; o stare pe care Connect nu a putut-o citi apare drept necunoscută, nu drept oprită.
- **URL-uri de publicare în clipboard.** RTSP, RTMP și SRT, construite din adresele de ascultare ale serverului însuși. Pagina fiecărui path merge mai departe cu un panou de publicare și citire: fiecare protocol servit de server, inclusiv WHIP, WHEP, HLS și variantele TLS, cu fragmente gata de copiat pentru ffmpeg, GStreamer, OBS, ffplay și VLC.

### Înregistrări

- O cronologie zilnică pentru fiecare flux, de la serverul de redare al MediaMTX: intervalele înregistrate și golurile dintre ele, fiecare putând fi redat. Dacă redarea e dezactivată, Connect listează exact modificările de configurare necesare și le aplică dintr-un clic.
- Descărcare de clipuri: orice interval de până la o oră (sau ultimele 5 min, 15 min ori ultima oră) ca un singur MP4 simplu, îmbinat peste segmente de MediaMTX fără re-codare.
- Segmente MP4 sau MPEG-TS pentru fiecare flux, grupate pe zile, cu miniaturi generate automat.
- Un player integrat care se desfășoară pe loc, derulabil prin cereri HTTP Range.
- Descărcări în flux, cu progres în timp real și anulare.
- Apasă `/` pentru a filtra.

### Sesiuni

- **Toți cei conectați, într-un singur tabel.** Publicatori și cititori prin RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC și HLS, cu adresa la distanță, octeții primiți și trimiși și timpul de conectare, reîmprospătate la fiecare 5 secunde.
- **Deconectează forțat un client** după o confirmare. Se poate reconecta; o deconectare forțată nu e o interdicție.

### Configurare, fără YAML

- **Configurația serverului:** 66 de controale tipizate și validate în Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC și SRT.
- **Path defaults și suprascrieri per path**, pe domeniile de unde MediaMTX le servește. Salvarea unui flux acoperit de wildcard scrie o intrare rară, așa că cheile neatinse continuă să urmeze valorile implicite.
- **Un catalog de path-uri** cu insigne pentru live și regex, un formular ghidat „adaugă o cameră RTSP” și revenire sau ștergere pentru intrarea proprie a oricărui path (cu avertisment dacă cineva e conectat).
- **Starea live pe pagina fiecărui path:** piste, cititori, octeți transferați, cadre cu erori și timp de funcționare, reîmprospătate la fiecare 5 secunde. Un path pe care nu publică nimic apare inactiv, nu defect.
- **Reziliență pe fiecare path:** o rezervă mereu disponibilă care rulează în buclă un clip offline cât timp camera e căzută, și preluare la cerere care deschide sursa doar cât timp se uită cineva.
- **Fiecare hook `runOn*`**, cu avertisment acolo unde salvarea repornește path-ul.
- **Redirecționare:** trimite un path către YouTube, Twitch sau alt server prin lista nativă `forward` a MediaMTX, cu cheile de stream mascate și fără repornirea path-ului.
- **Scrieri rare.** Se trimit doar cheile pe care le-ai schimbat.

### Exploatare

Un singur proces pentru API, SPA și media · multi-arhitectură · `GET /api/health` · versiunea MediaMTX în antet · loguri structurate · instalabil ca PWA · întunecat și deschis · 30 de limbi · fără bază de date.

## Variabile de mediu

Acestea însămânțează prima pornire. Totul rămâne editabil din **Config**.

| Variabilă | Implicit în imagine | La ce servește |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Unde ajunge Connect la API-ul MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Portul API-ului MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Unde ajunge *browserul* la MediaMTX pentru redare. Seteaz-o de fiecare dată când browserul nu rulează pe server |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | De unde citește Connect înregistrările |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Unde ajung instantaneele și miniaturile |
| `DATA_DIR` | `/data` | Unde se află `config.json` |
| `PORT` | `3000` | Portul HTTP |
| `LOG_LEVEL` | `info` | Nivelul de log Pino |

`http://mediamtx` se rezolvă doar în rețeaua compose-ului inclus. Pentru un `docker run` de sine stătător, pune adresa gazdei tale. Cu compose, setează `REMOTE_MEDIAMTX_HOST` în `.env` în loc de `REMOTE_MEDIAMTX_URL`: aceasta setează și gazda WebRTC pe care o anunță MediaMTX. [`.env.example`](../../.env.example) explică fiecare variabilă, iar `pnpm dev` folosește valori implicite pentru localhost fără niciun `.env`.

## Cum funcționează

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

Redarea live merge de la browser la MediaMTX. Connect mută JSON, plus înregistrările și miniaturile: de pe disc, sau intervale înregistrate trecute prin proxy de la serverul de redare al MediaMTX.

## Documentație

| | |
|---|---|
| [Funcționalități](../../docs/FEATURES.md) | Fiecare capabilitate, rută și procedură livrată |
| [Arhitectură](../../docs/ARCHITECTURE.md) | Cum se îmbină piesele |
| [Contribuții](../../CONTRIBUTING.md) | Mediu de dezvoltare, scripturi, procesul de PR |
| [Exemple](../../examples/) | Cameră Raspberry Pi, fluxuri false pentru teste |

## Contribuții

Issue-urile și PR-urile sunt binevenite. `pnpm install && pnpm dev` îți ridică tot stack-ul cu date de test. Vezi [CONTRIBUTING.md](../../CONTRIBUTING.md) și reține că titlurile de PR sunt conventional commits. Respectăm un [Cod de conduită](../../CODE_OF_CONDUCT.md).

## Licență

[MIT](../../LICENSE)
