<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> webes felülete.</strong><br>
Nézz élő adásokat, böngéssz a felvételek között, és szerkeszd bármelyik konfigurációs kulcsot — a böngésződből.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — élő adások rácsa, felvételböngésző és konfigurációszerkesztő" width="860">

</div>

## Mi ez

A MediaMTX kiváló streamingszerver, és felület nélkül érkezik. A Connect a hiányzó front-end: egyetlen konténer, amely a MediaMTX API-jával beszélget, és kamerafallá, felvételtárrá és konfigurációszerkesztővé alakítja.

Társ, nem helyettesítő. Minden képernyő olyasmire épül, amit a MediaMTX már közzétesz — egy path, egy API-végpont, egy `runOn*` hook, egy natívan kiszolgált protokoll. A Connect nem tárol videót, nem proxyzik médiát, és adatbázist sem használ. Irányítsd egy futó szerverre, és működik.

## Gyors indulás

A képek `linux/amd64` és `linux/arm64` platformra jelennek meg (Raspberry Pi, Apple Silicon és társaik), így a Docker a megfelelőt tölti le helyetted.

**Már fut a MediaMTX?** Állítsd mellé a Connectet:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**A nulláról indulsz?** A mellékelt compose mindkettőt elindítja:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Akárhogy is, nyisd meg a <http://localhost:3000> címet.

> [!IMPORTANT]
> A Connectnek `api: yes` kell a `mediamtx.yml` fájlodban — mindent ezen az API-n keresztül olvas és ír. A [mellékelt konfiguráció](../../mediamtx.yml) működő minta.

## Mit kapsz

### Élő nézet

Rács az összes path-ról, amiről a MediaMTX tud — 2, 3 vagy 4 oszlopban.

- **WebRTC vagy HLS, kártyánként.** Az `AUTO` a WebRTC-t részesíti előnyben, és csendben HLS-re vált, a `LOW-LAT` ragaszkodik a WebRTC-hez, a `COMPAT` pedig HLS-t kényszerít. Minden kártya saját kapcsolatot egyeztet, és azt a szállítást jelenti, amit ténylegesen kapott — sosem azt, amit kértél.
- **Pillanatképek üresjáratban is.** Egy háttérfeladat minden streamből elkap egy képkockát, így a nem játszó kártyák is mutatják a helyszínt, a képkocka korával a címkén. A «Pillanatkép készítése» azonnal hoz egyet.
- **Élő telemetria.** Kodekcímkék, nézőszám és üzemidő, egyenesen a path-listából — extra kérés nélkül.
- **Felvételi állapot, ami igazat mond.** A kártyák azt mutatják, hogy egy stream *ténylegesen* rögzít-e (a saját felülbírálása a path defaults tetejére olvasztva, pontosan úgy, ahogy a MediaMTX feloldja); az olvashatatlan állapot ismeretlenként jelenik meg, nem kikapcsoltként.
- **Közzétételi URL-ek a vágólapra.** Az RTSP-, RTMP- és SRT-célok a szerver saját figyelőcímeiből épülnek, így a megváltoztatott port továbbra is a helyes port.

### Felvételek

- Minden stream MP4-jei, napokra bontva, a legfrissebbtől, automatikusan generált bélyegképekkel.
- Helyben kinyíló lejátszó, valódi tekerősávval, HTTP Range kérésekre építve.
- Streamelő letöltések élő haladásjelzővel, sebességgel és Mégse gombbal.
- Nyomj `/` billentyűt bárhol a szűréshez.

### Konfiguráció YAML nélkül

- **A teljes szerverkonfiguráció** — 65 vezérlő a Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC és SRT szakaszokban, mindegyik típusos, validált és a te nyelveden dokumentált.
- **Path defaults és path-onkénti felülbírálások** azokon a hatókörökön, ahonnan a MediaMTX ténylegesen kiszolgálja őket. Egy helyettesítő karakterrel lefedett stream mentése ritka bejegyzést hoz létre, így az érintetlen kulcsok továbbra is az alapértékeket követik — a «visszaállítás örököltre» pedig visszavonja.
- **Mind a 15 `runOn*` path hook**, figyelmeztetéssel ott, ahol a mentés újraindítja a path-ot.
- **Ritka írások.** A Connect csak a megváltoztatott kulcsokat PATCH-eli; amit nem mutat, ahhoz nem nyúl.

### Olyan dobozra tervezve, amiről elfeledkezel

Egyetlen folyamat szolgálja ki az API-t, a SPA-t és a médiát · többarchitektúrás képek · `GET /health` · strukturált naplók · telepíthető PWA · világos és sötét téma · 30 nyelv · nincs adatbázis.

## Környezeti változók

Itt minden futás közben szerkeszthető a **Config** alatt — ezek a változók csak az első indulást vetik el.

| Változó | Alapérték | Mire való |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hol éri el a Connect a MediaMTX API-t a konténerén *belülről* |
| `MEDIAMTX_API_PORT` | `9997` | A MediaMTX API portja |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | A felvételekhez csatolt hoszt-útvonal (csak compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Hová kerülnek a generált bélyegképek |

Az alapértelmezett `http://mediamtx` csak a mellékelt compose hálózatán oldódik fel. Önálló `docker run` esetén add meg a saját MediaMTX hosztodat — vagy javítsd később a **Config** alatt, újraindítás nélkül.

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

A lejátszás a böngészőből közvetlenül a MediaMTX-hez megy. A Connect csak JSON-t mozgat, plusz a lemezről olvasott felvételeket és bélyegképeket.

## Dokumentáció

| | |
|---|---|
| [Funkciók](../FEATURES.md) | Minden kiadott képesség, útvonal és eljárás |
| [Architektúra](../../ARCHITECTURE.md) | Hogyan illeszkednek a darabok |
| [Közreműködés](../../CONTRIBUTING.md) | Fejlesztői környezet, szkriptek, PR-folyamat |
| [Példák](../../examples/) | Raspberry Pi kamera, hamis streamek teszteléshez |

## Közreműködés

A hibajegyeket és PR-eket szívesen fogadjuk. A `pnpm install && pnpm dev` teljes stacket ad tesztadatokkal — a többit lásd a [CONTRIBUTING.md](../../CONTRIBUTING.md) fájlban, és vedd figyelembe, hogy a PR-címek [conventional commits](../../CONTRIBUTING.md) formátumúak. A projekt [magatartási kódexet](../../CODE_OF_CONDUCT.md) követ.

## Licenc

[MIT](../../LICENSE)
