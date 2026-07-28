<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>:n web-käyttöliittymä.</strong><br>
Katso live-lähetyksiä, selaa tallenteita, muokkaa mitä tahansa asetusavainta — suoraan selaimessa.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — live-lähetysten ruudukko, tallenneselain ja asetuseditori" width="860">

<details>
<summary>🌍 Lue 30 kielellä</summary>
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
  🇫🇮 <strong>Suomi</strong> •
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

## Mikä tämä on

MediaMTX on erinomainen suoratoistopalvelin ilman käyttöliittymää. Connect on se puuttuva käyttöliittymä: yksi kontti, joka juttelee MediaMTX:n API:n kanssa ja muuttaa sen kameraseinäksi, tallennearkistoksi ja asetuseditoriksi.

Se on kumppani, ei korvaaja. Jokainen näkymä nojaa johonkin, minkä MediaMTX jo tarjoaa: path, API-päätepiste, `runOn*`-koukku, protokolla jota se itse jakaa. Ei säilö videota, ei välitä mediaa, ei tietokantaa.

## Pika-aloitus

Moniarkkitehtuuri-imaget (`linux/amd64`, `linux/arm64`) — Docker hakee oikean.

**Onko MediaMTX jo käynnissä?** Laita Connect sen viereen:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Aloitatko tyhjästä?** Mukana tuleva compose käynnistää molemmat:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Avaa sitten <http://localhost:3000>.

> [!IMPORTANT]
> Connect tarvitsee `mediamtx.yml`-tiedostoosi rivin `api: yes`. [Mukana tuleva asetustiedosto](../../mediamtx.yml) toimii sellaisenaan.

## Mitä saat

### Livenäkymä

Kaikki path-polut, jotka MediaMTX tuntee, 2–4 sarakkeen ruudukossa.

- **WebRTC tai HLS, korttikohtaisesti.** `AUTO` putoaa hiljaa HLS:ään, `LOW-LAT` vaatii WebRTC:tä ja `COMPAT` pakottaa HLS:n — ja jokainen kortti kertoo, minkä siirtotavan se todella sai.
- **Tilannekuvia myös levossa.** Taustatyö pitää jokaisella kortilla tuoretta kuvaa, ja sen ikä lukee merkissä.
- **Live-telemetria.** Koodekit, katsojamäärä ja käyntiaika suoraan path-listasta.
- **Rehellinen tallennustila.** Kortit näyttävät, tallentaako striimi *tosiasiassa*; tila jota Connect ei saanut luettua on tuntematon, ei koskaan pois.
- **Julkaisuosoitteet leikepöydälle.** RTSP, RTMP ja SRT rakennetaan palvelimen omista kuunteluosoitteista.

### Tallenteet

- Jokaisen striimin MP4-tiedostot päivittäin ryhmiteltyinä, automaattisin pikkukuvin.
- Soitin, joka avautuu paikallaan ja kelaa HTTP Range -pyynnöillä.
- Suoratoistavat lataukset: edistyminen reaaliajassa ja peruutus.
- Suodata painamalla `/`.

### Asetukset ilman YAML:ia

- **Koko palvelinkonfiguraatio** — 65 tyypitettyä ja validoitua säädintä osioissa Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC ja SRT.
- **Path defaults ja polkukohtaiset ohitukset** niissä laajuuksissa, joista MediaMTX ne tarjoaa. Jokerimerkin kattaman striimin tallentaminen kirjoittaa harvan merkinnän, joten koskemattomat avaimet periytyvät edelleen.
- **Kaikki 15 `runOn*`-koukkua**, varoituksin siellä missä tallennus käynnistää polun uudelleen.
- **Harvat kirjoitukset** — vain muuttamasi avaimet.

### Ylläpito

Yksi prosessi API:lle, SPA:lle ja medioille · moniarkkitehtuuri · `GET /health` · rakenteiset lokit · PWA · vaalea ja tumma · 30 kieltä · ei tietokantaa.

## Ympäristömuuttujat

Ne siementävät vain ensimmäisen käynnistyksen. Loppu on muokattavissa **Config**-näkymässä.

| Muuttuja | Oletus | Tarkoitus |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Mistä Connect tavoittaa MediaMTX:n API:n konttinsa sisältä |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX:n API-portti |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Isäntäkoneen polku tallenteille (vain compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Minne pikkukuvat tallennetaan |

`http://mediamtx` ratkeaa vain mukana tulevan composen verkossa — erilliselle `docker run` -ajolle osoita se omaan koneeseesi.

## Miten se toimii

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

Toisto kulkee selaimesta MediaMTX:ään. Connect siirtää vain JSONia sekä levyltä lukemansa tallenteet ja pikkukuvat.

## Dokumentaatio

| | |
|---|---|
| [Ominaisuudet](../FEATURES.md) | Kaikki julkaistut kyvyt, reitit ja proseduurit |
| [Arkkitehtuuri](../../ARCHITECTURE.md) | Miten palaset loksahtavat yhteen |
| [Osallistuminen](../../CONTRIBUTING.md) | Kehitysympäristö, skriptit, PR-prosessi |
| [Esimerkit](../../examples/) | Raspberry Pi -kamera, testien valestriimit |

## Osallistuminen

Issuet ja PR:t ovat tervetulleita. `pnpm install && pnpm dev` pystyttää koko pinon testidatoineen — loput tiedostossa [CONTRIBUTING.md](../../CONTRIBUTING.md), ja huomaa että PR-otsikot ovat conventional commits. Noudatamme [käytössääntöjä](../../CODE_OF_CONDUCT.md).

## Lisenssi

[MIT](../../LICENSE)
