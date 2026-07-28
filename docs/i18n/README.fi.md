<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>:n web-käyttöliittymä.</strong><br>
Katso live-lähetyksiä, selaa tallenteita ja muokkaa mitä tahansa asetusavainta — suoraan selaimessa.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — live-lähetysten ruudukko, tallenneselain ja asetuseditori" width="860">

</div>

## Mikä tämä on

MediaMTX on erinomainen suoratoistopalvelin, ja se tulee ilman käyttöliittymää. Connect on siitä puuttuva käyttöliittymä: yksi kontti, joka juttelee MediaMTX:n API:n kanssa ja muuttaa sen kameraseinäksi, tallennearkistoksi ja asetuseditoriksi.

Se on kumppani, ei korvaaja. Jokainen näkymä nojaa johonkin, minkä MediaMTX jo tarjoaa — path, API-päätepiste, `runOn*`-koukku, protokolla jota se itse jakaa. Connect ei säilö videota, ei välitä mediaa eikä pidä tietokantaa. Osoita se käynnissä olevaan palvelimeen, ja se toimii.

## Pika-aloitus

Imaget julkaistaan alustoille `linux/amd64` ja `linux/arm64` (Raspberry Pi, Apple Silicon ja kumppanit), joten Docker hakee oikean puolestasi.

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

Kummin tahansa: avaa <http://localhost:3000>.

> [!IMPORTANT]
> Connect tarvitsee `mediamtx.yml`-tiedostoosi rivin `api: yes` — kaikki luku ja kirjoitus kulkee sen API:n kautta. [Mukana tuleva asetustiedosto](../../mediamtx.yml) on toimiva malli.

## Mitä saat

### Livenäkymä

Ruudukko kaikista path-poluista, jotka MediaMTX tuntee — 2, 3 tai 4 saraketta.

- **WebRTC tai HLS, korttikohtaisesti.** `AUTO` suosii WebRTC:tä ja putoaa hiljaa HLS:ään, `LOW-LAT` vaatii WebRTC:tä ja `COMPAT` pakottaa HLS:n. Jokainen kortti neuvottelee oman yhteytensä ja kertoo, minkä siirtotavan se todella sai — ei koskaan sitä, jota pyysit.
- **Tilannekuvia myös levossa.** Taustatyö nappaa jokaisesta striimistä kuvan, joten toistamattomatkin kortit näyttävät näkymän, ja kuvan ikä lukee merkissä. «Ota tilannekuva» hakee sellaisen heti.
- **Live-telemetria.** Koodekkimerkit, katsojamäärä ja käyntiaika suoraan path-listasta — ilman lisäkutsuja.
- **Tallennustila, joka puhuu totta.** Kortit näyttävät, tallentaako striimi *tosiasiassa* (sen oma ohitus yhdistettynä path defaults -arvojen päälle, juuri niin kuin MediaMTX sen ratkaisee); tila jota ei saatu luettua näkyy tuntemattomana eikä poissa-tilana.
- **Julkaisuosoitteet leikepöydälle.** RTSP-, RTMP- ja SRT-kohteet rakennetaan palvelimen omista kuunteluosoitteista, joten vaihdettu portti on yhä oikea portti.

### Tallenteet

- Jokaisen striimin MP4-tiedostot päivittäin ryhmiteltyinä, uusimmat ensin, automaattisesti luoduin pikkukuvin.
- Soitin, joka avautuu paikallaan, ja aito kelauspalkki HTTP Range -pyyntöjen varassa.
- Suoratoistavat lataukset: edistyminen reaaliajassa, nopeus ja peruutuspainike.
- Paina `/` missä tahansa suodattaaksesi.

### Asetukset ilman YAML:ia

- **Koko palvelinkonfiguraatio** — 65 säädintä osioissa Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC ja SRT, kukin tyypitettynä, validoituna ja omalla kielelläsi dokumentoituna.
- **Path defaults ja polkukohtaiset ohitukset** niissä laajuuksissa, joista MediaMTX ne oikeasti tarjoaa. Jokerimerkin kattaman striimin tallentaminen luo harvan merkinnän, joten koskemattomat avaimet seuraavat yhä oletuksia — ja «palauta peritty» kumoaa sen.
- **Kaikki 15 `runOn*`-polkukoukkua**, varoituksin siellä missä tallennus käynnistää polun uudelleen.
- **Harvat kirjoitukset.** Connect PATCH-kutsuu vain muuttamasi avaimet; mitä se ei näytä, siihen se ei koske.

### Tehty laatikolle, jonka unohtaa

Yksi prosessi tarjoaa API:n, SPA:n ja mediat · moniarkkitehtuuri-imaget · `GET /health` · rakenteiset lokit · asennettava PWA · vaalea ja tumma teema · 30 kieltä · ei tietokantaa.

## Ympäristömuuttujat

Kaikkea tätä voi muokata ajon aikana **Config**-näkymässä — muuttujat vain siementävät ensimmäisen käynnistyksen.

| Muuttuja | Oletus | Tarkoitus |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Mistä Connect tavoittaa MediaMTX:n API:n konttinsa *sisältä* |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX:n API-portti |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Isäntäkoneen polku tallenteille (vain compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Minne luodut pikkukuvat tallennetaan |

Oletus `http://mediamtx` ratkeaa vain mukana tulevan composen verkossa. Erilliselle `docker run` -ajolle aseta oma MediaMTX-isäntäsi — tai korjaa se myöhemmin **Config**-näkymässä ilman uudelleenkäynnistystä.

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

Toisto kulkee selaimesta suoraan MediaMTX:ään. Connect siirtää vain JSONia sekä levyltä lukemansa tallenteet ja pikkukuvat.

## Dokumentaatio

| | |
|---|---|
| [Ominaisuudet](../FEATURES.md) | Kaikki julkaistut kyvyt, reitit ja proseduurit |
| [Arkkitehtuuri](../../ARCHITECTURE.md) | Miten palaset loksahtavat yhteen |
| [Osallistuminen](../../CONTRIBUTING.md) | Kehitysympäristö, skriptit, PR-prosessi |
| [Esimerkit](../../examples/) | Raspberry Pi -kamera, testien valestriimit |

## Osallistuminen

Issuet ja PR:t ovat tervetulleita. `pnpm install && pnpm dev` pystyttää koko pinon testidatoineen — loput löytyvät tiedostosta [CONTRIBUTING.md](../../CONTRIBUTING.md), ja huomaa että PR-otsikot ovat [conventional commits](../../CONTRIBUTING.md). Projekti noudattaa [käytössääntöjä](../../CODE_OF_CONDUCT.md).

## Lisenssi

[MIT](../../LICENSE)
