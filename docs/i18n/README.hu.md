<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> webes felülete.</strong><br>
Nézz élő adásokat, böngéssz a felvételek között, és szerkeszd a MediaMTX-konfigurációdat a böngészőből.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — élő adások rácsa, felvételböngésző és konfigurációszerkesztő" width="860">

<details>
<summary>🌍 Olvasd el 30 nyelven</summary>
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
  🇩🇰 <a href="./README.da.md">Dansk</a> •
  🇳🇴 <a href="./README.no.md">Norsk</a> •
  🇫🇮 <a href="./README.fi.md">Suomi</a> •
  🇬🇷 <a href="./README.el.md">Ελληνικά</a> •
  🇭🇺 <strong>Magyar</strong> •
  🇺🇦 <a href="./README.uk.md">Українська</a> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## Mi ez

A MediaMTX kiváló streamingszerver, felület nélkül. A Connect a hiányzó front-end: egyetlen konténer, amely a MediaMTX API-jával beszélget, és kamerafallá, felvételtárrá és konfigurációszerkesztővé alakítja.

Társ, nem helyettesítő. Minden képernyő olyasmire épül, amit a MediaMTX már közzétesz: egy path, egy API-végpont, egy `runOn*` hook, egy natívan kiszolgált protokoll. Nem tárol videót, nem proxyzik médiát, nincs adatbázisa.

## Gyors indulás

Többarchitektúrás képek (`linux/amd64`, `linux/arm64`); a Docker a megfelelőt tölti le.

**Már fut a MediaMTX?** Állítsd mellé a Connectet:

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

**A nulláról indulsz?** A mellékelt compose lefordítja a Connectet, és a MediaMTX mellett futtatja:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Utána nyisd meg a <http://localhost:3000> címet.

> [!IMPORTANT]
> A Connectnek `api: yes` kell a `mediamtx.yml` fájlodban. A [mellékelt konfiguráció](../../mediamtx.yml) így, ahogy van, működik.

## Mit kapsz

### Élő nézet

Minden path, amiről a MediaMTX tud, 2–4 oszlopos rácsban.

- **WebRTC vagy HLS, kártyánként.** Az `AUTO` csendben tartalékra vált, a `LOW-LAT` ragaszkodik a WebRTC-hez, a `COMPAT` HLS-t kényszerít. Minden kártya azt a szállítást jelzi, amit ténylegesen kapott.
- **Pillanatképek üresjáratban.** Egy háttérfeladat friss képkockát tart minden kártyán, a képkocka korával a címkén. Most kell egy friss? Készítsd el a kártya menüjéből.
- **Élő telemetria.** Kodekek, nézőszám és üzemidő, egyenesen a path-listából.
- **Őszinte felvételi állapot.** A kártyák azt mutatják, hogy egy stream *ténylegesen* rögzít-e; amit a Connect nem tudott kiolvasni, azt ismeretlennek hívja, sosem kikapcsoltnak.
- **Közzétételi URL-ek a vágólapra.** RTSP, RTMP és SRT, a szerver saját figyelőcímeiből építve. Minden path oldala ennél is tovább megy egy közzétételi és olvasási panellel: a szerver által kiszolgált összes protokoll, köztük a WHIP, a WHEP, a HLS és a TLS-változatok, másolásra kész ffmpeg, GStreamer, OBS, ffplay és VLC parancsrészletekkel.

### Felvételek

- Napi idővonal streamenként a MediaMTX lejátszási szerveréből: a rögzített szakaszok és a köztük lévő hézagok, mindegyik lejátszható. Ha a lejátszás ki van kapcsolva, a Connect felsorolja a pontosan szükséges konfigurációs módosításokat, és egy kattintással alkalmazza őket.
- Klipletöltés: bármely legfeljebb egyórás tartomány (vagy az utolsó 5 perc, 15 perc vagy óra) egyetlen sima MP4-ként, amelyet a MediaMTX újrakódolás nélkül fűz össze a szegmensekből.
- MP4 vagy MPEG-TS szegmensek streamenként, napokra bontva, automatikus bélyegképekkel.
- Helyben kinyíló lejátszó, HTTP Range kérésekkel tekerhető.
- Streamelő letöltések élő haladásjelzővel és megszakítással.
- Szűréshez nyomd meg a `/` billentyűt.

### Munkamenetek

- **Minden csatlakozott fél egy táblázatban.** Közzétevők és olvasók RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC és HLS felett, távoli címmel, bejövő és kimenő bájtokkal és üzemidővel, 5 másodpercenként frissítve.
- **Kliens kirúgása** megerősítés után. Újracsatlakozhat; a kirúgás nem kitiltás.

### Konfiguráció YAML nélkül

- **A szerverkonfiguráció:** 66 típusos, validált vezérlő a Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC és SRT szakaszokban.
- **Path defaults és path-onkénti felülbírálások** azokon a hatókörökön, ahonnan a MediaMTX kiszolgálja őket. Egy helyettesítő karakterrel lefedett stream mentése ritka bejegyzést ír, így az érintetlen kulcsok továbbra is az alapértékeket követik.
- **Path-katalógus** élő és regex jelvényekkel, vezetett „RTSP-kamera hozzáadása” űrlappal, valamint bármely path saját bejegyzésének visszaállításával vagy törlésével (figyelmeztetéssel, ha valaki csatlakozva van).
- **Élő állapot minden path oldalán:** sávok, olvasók, mozgatott bájtok, hibás képkockák és üzemidő, 5 másodpercenként frissítve. Az a path, amelyre senki nem tesz közzé, tétlennek látszik, nem hibásnak.
- **Hibatűrés minden path-on:** mindig elérhető tartalék, amely offline klipet játszik ismétlésben, amíg a kamera nem elérhető, és igény szerinti behúzás, amely csak akkor nyitja meg a forrást, ha valaki nézi.
- **Minden `runOn*` hook**, figyelmeztetéssel ott, ahol a mentés újraindítja a path-ot.
- **Továbbítás:** küldj egy path-ot a YouTube-ra, a Twitchre vagy másik szerverre a MediaMTX natív `forward` listáján keresztül, maszkolt streamkulcsokkal és a path újraindítása nélkül.
- **Ritka írások.** Csak a megváltoztatott kulcsok kerülnek elküldésre.

### Üzemeltetés

Egyetlen folyamat az API-nak, a SPA-nak és a médiának · többarchitektúrás · `GET /api/health` · MediaMTX-verzió a fejlécben · strukturált naplók · PWA-ként telepíthető · világos és sötét · 30 nyelv · nincs adatbázis.

## Környezeti változók

Ezek az első indulás kezdőértékei. Minden szerkeszthető marad a **Config** alatt.

| Változó | Alapérték a képben | Mire való |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hol éri el a Connect a MediaMTX API-t |
| `MEDIAMTX_API_PORT` | `9997` | A MediaMTX API portja |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Hol éri el a *böngésző* a MediaMTX-et lejátszáshoz. Állítsd be, ha a böngésző nem a szerveren fut |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Honnan olvassa a Connect a felvételeket |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hová kerülnek a pillanatképek és a bélyegképek |
| `DATA_DIR` | `/data` | Hol található a `config.json` |
| `PORT` | `3000` | HTTP-port |
| `LOG_LEVEL` | `info` | Pino naplózási szint |

A `http://mediamtx` csak a mellékelt compose hálózatán oldódik fel. Önálló `docker run` esetén add meg a saját hosztodat. Compose használatakor a `REMOTE_MEDIAMTX_URL` helyett a `REMOTE_MEDIAMTX_HOST` értéket állítsd be az `.env` fájlban: ez a MediaMTX által hirdetett WebRTC-hosztot is beállítja. A [`.env.example`](../../.env.example) mindegyiket elmagyarázza, a `pnpm dev` pedig localhost alapértékekkel fut, `.env` nélkül.

## Hogyan működik

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

Az élő lejátszás a böngészőből közvetlenül a MediaMTX-hez megy. A Connect JSON-t mozgat, plusz a felvételeket és bélyegképeket: a lemezről, vagy a MediaMTX lejátszási szerveréről proxyzott rögzített szakaszokként.

## Dokumentáció

| | |
|---|---|
| [Funkciók](../../docs/FEATURES.md) | Minden kiadott képesség, útvonal és eljárás |
| [Architektúra](../../docs/ARCHITECTURE.md) | Hogyan illeszkednek a darabok |
| [Közreműködés](../../CONTRIBUTING.md) | Fejlesztői környezet, szkriptek, PR-folyamat |
| [Példák](../../examples/) | Raspberry Pi kamera, hamis streamek teszteléshez |

## Közreműködés

A hibajegyeket és PR-eket szívesen fogadjuk. A `pnpm install && pnpm dev` teljes stacket ad tesztadatokkal. Lásd a [CONTRIBUTING.md](../../CONTRIBUTING.md) fájlt, és vedd figyelembe, hogy a PR-címek conventional commits formátumúak. [Magatartási kódexet](../../CODE_OF_CONDUCT.md) követünk.

## Licenc

[MIT](../../LICENSE)
