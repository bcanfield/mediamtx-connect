<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Interfața web pentru <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Urmărește transmisiuni live, răsfoiește înregistrări și editează orice cheie de configurare — din browser.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — grila transmisiunilor live, browserul de înregistrări și editorul de configurare" width="860">

</div>

## Ce este

MediaMTX este un server de streaming excelent și vine fără interfață. Connect este front-end-ul care îi lipsește: un singur container care vorbește cu API-ul MediaMTX și îl transformă într-un perete de camere, o arhivă de înregistrări și un editor de configurare.

Este un însoțitor, nu un înlocuitor. Fiecare ecran se sprijină pe ceva ce MediaMTX expune deja — un path, un endpoint de API, un hook `runOn*`, un protocol pe care îl servește nativ. Connect nu stochează video, nu face proxy pentru media și nu ține bază de date. Îndreaptă-l spre un server pornit și merge.

## Pornire rapidă

Imaginile sunt publicate pentru `linux/amd64` și `linux/arm64` (Raspberry Pi, Apple Silicon și rudele lor), așa că Docker o descarcă pe cea potrivită în locul tău.

**Ai deja MediaMTX pornit?** Pune Connect lângă el:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Pornești de la zero?** Fișierul compose inclus le ridică pe amândouă:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Oricum ai face, deschide <http://localhost:3000>.

> [!IMPORTANT]
> Connect are nevoie de `api: yes` în `mediamtx.yml` — prin acel API citește și scrie tot. [Configurația inclusă](../../mediamtx.yml) este o referință funcțională.

## Ce primești

### Vizualizare live

O grilă cu fiecare path pe care îl cunoaște MediaMTX, pe 2, 3 sau 4 coloane.

- **WebRTC sau HLS, de la card la card.** `AUTO` preferă WebRTC și coboară în tăcere la HLS, `LOW-LAT` insistă pe WebRTC, iar `COMPAT` impune HLS. Fiecare card își negociază propria conexiune și raportează transportul obținut efectiv — niciodată pe cel cerut.
- **Instantanee și când stă.** O sarcină de fundal prinde un cadru din fiecare flux, așa că un card inactiv tot arată scena, cu vechimea cadrului pe etichetă. «Ia un instantaneu» îl obține pe loc.
- **Telemetrie live.** Etichete de codec, număr de spectatori și timp de funcționare, direct din lista de path — fără cereri suplimentare.
- **Stare de înregistrare care spune adevărul.** Cardurile arată dacă un flux înregistrează *efectiv* (suprascrierea proprie topită peste path defaults, exact cum o rezolvă MediaMTX); o stare care nu a putut fi citită apare drept necunoscută, nu drept oprită.
- **URL-uri de publicare în clipboard.** Țintele RTSP, RTMP și SRT sunt construite din adresele de ascultare ale serverului însuși, așa că un port schimbat rămâne portul corect.

### Înregistrări

- Fișierele MP4 ale fiecărui flux, grupate pe zile, cele mai noi primele, cu miniaturi generate automat.
- Un player care se desfășoară pe loc, cu o bară de derulare reală, sprijinită pe cereri HTTP Range.
- Descărcări în flux, cu progres în timp real, viteză și buton de anulare.
- Apasă `/` oriunde pentru a filtra.

### Configurare, fără YAML

- **Toată configurația serverului** — 65 de controale în Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC și SRT, fiecare tipizat, validat și documentat în limba ta.
- **Path defaults și suprascrieri per path**, pe domeniile de unde MediaMTX le servește cu adevărat. Salvarea unui flux acoperit de wildcard materializează o intrare rară, așa că cheile neatinse continuă să urmeze valorile implicite — iar «revino la moștenit» anulează totul.
- **Toate cele 15 hook-uri de path `runOn*`**, cu avertisment acolo unde salvarea repornește path-ul.
- **Scrieri rare.** Connect trimite prin PATCH doar cheile pe care le-ai schimbat; ce nu expune rămâne neatins.

### Făcut pentru o cutie pe care o uiți

Un singur proces servește API-ul, SPA-ul și media · imagini multi-arhitectură · `GET /health` · loguri structurate · PWA instalabilă · teme deschisă și închisă · 30 de limbi · fără bază de date.

## Variabile de mediu

Totul de aici se poate edita în timpul rulării din **Config** — variabilele doar însămânțează prima pornire.

| Variabilă | Implicit | La ce servește |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Unde ajunge Connect la API-ul MediaMTX din *interiorul* containerului său |
| `MEDIAMTX_API_PORT` | `9997` | Portul API-ului MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Calea de pe gazdă montată pentru înregistrări (doar compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Unde ajung miniaturile generate |

Valoarea implicită `http://mediamtx` se rezolvă doar în rețeaua compose-ului inclus. Pentru un `docker run` de sine stătător, pune adresa gazdei tale MediaMTX — sau corecteaz-o mai târziu din **Config**, fără repornire.

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

Redarea merge direct de la browser la MediaMTX. Connect mută doar JSON, plus înregistrările și miniaturile pe care le citește de pe disc.

## Documentație

| | |
|---|---|
| [Funcționalități](../FEATURES.md) | Fiecare capabilitate, rută și procedură livrată |
| [Arhitectură](../../ARCHITECTURE.md) | Cum se îmbină piesele |
| [Contribuții](../../CONTRIBUTING.md) | Mediu de dezvoltare, scripturi, procesul de PR |
| [Exemple](../../examples/) | Cameră Raspberry Pi, fluxuri false pentru teste |

## Contribuții

Issue-urile și PR-urile sunt binevenite. `pnpm install && pnpm dev` îți ridică tot stack-ul cu date de test — restul în [CONTRIBUTING.md](../../CONTRIBUTING.md), iar titlurile de PR sunt [conventional commits](../../CONTRIBUTING.md). Proiectul respectă un [Cod de conduită](../../CODE_OF_CONDUCT.md).

## Licență

[MIT](../../LICENSE)
