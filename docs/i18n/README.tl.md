<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Ang web UI para sa <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Manood ng live na stream, mag-browse ng mga recording, at i-edit ang kahit anong config key — mula sa browser mo.</p>

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
  🇭🇺 <a href="./README.hu.md">Magyar</a> •
  🇺🇦 <a href="./README.uk.md">Українська</a> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <strong>Tagalog</strong> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — grid ng live na stream, browser ng recording, at editor ng configuration" width="860">

</div>

## Ano ito

Napakagaling na streaming server ang MediaMTX, at wala itong kasamang interface. Ang Connect ang nawawalang front-end: isang container na kausap ang API ng MediaMTX at ginagawa itong pader ng kamera, imbakan ng recording, at editor ng configuration.

Kasama ito, hindi kapalit. Bawat screen ay nakasandal sa isang bagay na inilalantad na ng MediaMTX — isang path, isang API endpoint, isang `runOn*` hook, isang protocol na siya mismo ang naghahain. Walang video na iniimbak ang Connect, walang media na pinoproxy, at walang database. Ituro mo lang sa isang tumatakbong server at gagana na.

## Mabilisang simula

Nailalabas ang mga image para sa `linux/amd64` at `linux/arm64` (Raspberry Pi, Apple Silicon, at kauri), kaya ang Docker na ang bahalang kunin ang tama.

**Tumatakbo na ang MediaMTX?** Itabi mo lang ang Connect:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Wala pang kahit ano?** Sabay itinataas ng kasamang compose ang dalawa:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Alinman doon, buksan ang <http://localhost:3000>.

> [!IMPORTANT]
> Kailangan ng Connect ang `api: yes` sa `mediamtx.yml` mo — sa API na iyon dumadaan ang lahat ng pagbabasa at pagsulat. Gumaganang sanggunian ang [kasamang configuration](../../mediamtx.yml).

## Ano ang makukuha mo

### Live na tanawin

Isang grid ng bawat path na kilala ng MediaMTX, sa 2, 3, o 4 na hanay.

- **WebRTC o HLS, bawat card.** Mas gusto ng `AUTO` ang WebRTC at tahimik itong babagsak sa HLS, ipinipilit ng `LOW-LAT` ang WebRTC, at pinipilit ng `COMPAT` ang HLS. Bawat card ay may sariling negosasyon ng koneksyon at iniuulat ang transport na talagang nakuha nito — hindi kailanman ang hiniling mo.
- **May snapshot kahit tahimik.** May background job na kumukuha ng frame sa bawat stream, kaya kahit hindi nagpe-play ang card ay nakikita pa rin ang eksena, kasama ang edad ng frame sa pill. Agad namang kumukuha ng isa ang «Kumuha ng snapshot».
- **Live na telemetry.** Mga chip ng codec, bilang ng manonood, at oras na nakaonline, diretso mula sa listahan ng path — walang dagdag na request.
- **Katayuan ng recording na totoo.** Ipinapakita ng mga card kung *talagang* nagre-record ang isang stream (ang sarili nitong override na isinanib sa ibabaw ng path defaults, gaya ng pagreresolba ng MediaMTX); ang katayuang hindi nabasa ay lumalabas na hindi tiyak sa halip na naka-off.
- **Mga publish URL sa clipboard.** Ang mga target na RTSP, RTMP, at SRT ay binubuo mula sa sariling listen address ng server, kaya kahit binago ang port ay tama pa rin ang port.

### Mga recording

- Ang mga MP4 ng bawat stream, nakagrupo kada araw, pinakabago muna, may awtomatikong nabuong thumbnail.
- Isang player na bumubukas sa mismong lugar nito, may tunay na seekbar na nakasandal sa mga HTTP Range request.
- Mga download na dumadaloy, may live na progreso, bilis, at pindutang pangkansela.
- Pindutin ang `/` kahit saan para mag-filter.

### Configuration, walang YAML

- **Ang buong configuration ng server** — 65 kontrol sa Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, at SRT, bawat isa ay may tipo, na-validate, at may paliwanag sa wika mo.
- **Path defaults at override kada path**, sa mismong saklaw kung saan talaga ito inihahain ng MediaMTX. Ang pag-save ng stream na sakop ng wildcard ay lumilikha ng payak na entry, kaya ang mga key na hindi mo ginalaw ay patuloy na sumusunod sa default — at binabawi ito ng «ibalik sa minana».
- **Lahat ng 15 `runOn*` path hook**, may babala kung saan nagre-restart ng path ang pag-save.
- **Payak na pagsulat.** Ang mga key lang na binago mo ang ipina-PATCH ng Connect; hindi nito ginagalaw ang mga bagay na hindi nito inilalantad.

### Ginawa para sa kahong nakakalimutan mo

Iisang proseso ang naghahain ng API, SPA, at media · multi-arch na image · `GET /health` · nakabalangkas na log · nai-install na PWA · maliwanag at madilim na tema · 30 wika · walang database.

## Mga environment variable

Lahat ng ito ay nababago habang tumatakbo sa ilalim ng **Config** — ito ay para lang sa unang boot.

| Variable | Default | Layunin |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Kung saan naaabot ng Connect ang MediaMTX API mula sa *loob* ng container nito |
| `MEDIAMTX_API_PORT` | `9997` | Port ng MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Path sa host na naka-mount para sa mga recording (compose lang) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kung saan itinatago ang mga nabuong thumbnail |

Ang default na `http://mediamtx` ay nareresolba lang sa network ng kasamang compose. Para sa nag-iisang `docker run`, itakda ito sa sarili mong MediaMTX host — o ayusin mamaya sa ilalim ng **Config**, walang restart na kailangan.

## Paano ito gumagana

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

Diretso mula sa browser patungong MediaMTX ang playback. JSON lang ang inilillipat ng Connect, saka ang mga recording at thumbnail na binabasa nito sa disk.

## Dokumentasyon

| | |
|---|---|
| [Mga tampok](../FEATURES.md) | Bawat kakayahan, ruta, at procedure na nailabas na |
| [Arkitektura](../../ARCHITECTURE.md) | Kung paano nagkakasya ang mga piyesa |
| [Pag-ambag](../../CONTRIBUTING.md) | Setup sa dev, mga script, proseso ng PR |
| [Mga halimbawa](../../examples/) | Kamera sa Raspberry Pi, pekeng stream para sa pagsubok |

## Pag-ambag

Malugod na tinatanggap ang mga issue at PR. Ang `pnpm install && pnpm dev` ay nagbibigay ng buong stack na may seeded na datos — tingnan ang [CONTRIBUTING.md](../../CONTRIBUTING.md) para sa iba pa, at tandaan na ang mga pamagat ng PR ay [conventional commits](../../CONTRIBUTING.md). Sinusunod ng proyektong ito ang isang [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Lisensya

[MIT](../../LICENSE)
