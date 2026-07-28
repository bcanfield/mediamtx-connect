<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Ang web UI para sa <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Manood ng live na stream, mag-browse ng mga recording, i-edit ang kahit anong config key — mula sa browser mo.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grid ng live na stream, browser ng recording, at editor ng configuration" width="860">

<details>
<summary>🌍 Basahin sa 30 wika</summary>
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
</details>

</div>

## Ano ito

Napakagaling na streaming server ang MediaMTX, pero walang kasamang interface. Ang Connect ang nawawalang front-end: isang container na kausap ang API ng MediaMTX at ginagawa itong pader ng kamera, imbakan ng recording, at editor ng configuration.

Kasama ito, hindi kapalit. Bawat screen ay nakasandal sa isang bagay na inilalantad na ng MediaMTX: isang path, isang API endpoint, isang `runOn*` hook, isang protocol na siya mismo ang naghahain. Walang iniimbak na video, walang pinoproxy na media, walang database.

## Mabilisang simula

Mga multi-arch na image (`linux/amd64`, `linux/arm64`) — ang Docker na ang kukuha ng tama.

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

Pagkatapos ay buksan ang <http://localhost:3000>.

> [!IMPORTANT]
> Kailangan ng Connect ang `api: yes` sa `mediamtx.yml` mo. Gumagana agad ang [kasamang configuration](../../mediamtx.yml).

## Ano ang makukuha mo

### Live na tanawin

Bawat path na kilala ng MediaMTX, sa grid na 2 hanggang 4 na hanay.

- **WebRTC o HLS, bawat card.** Tahimik na bumabagsak sa HLS ang `AUTO`, ipinipilit ng `LOW-LAT` ang WebRTC, at pinipilit ng `COMPAT` ang HLS — at iniuulat ng bawat card ang transport na talagang nakuha nito.
- **May snapshot kahit tahimik.** May background job na nagtatago ng sariwang frame sa bawat card, kasama ang edad nito sa pill.
- **Live na telemetry.** Mga codec, bilang ng manonood, at oras na nakaonline, diretso mula sa listahan ng path.
- **Tapat na katayuan ng recording.** Ipinapakita ng mga card kung *talagang* nagre-record ang isang stream; ang katayuang hindi nabasa ng Connect ay tinatawag na hindi tiyak, hindi kailanman naka-off.
- **Mga publish URL sa clipboard.** RTSP, RTMP, at SRT, binuo mula sa sariling listen address ng server.

### Mga recording

- Ang mga MP4 ng bawat stream, nakagrupo kada araw, may awtomatikong thumbnail.
- Isang player na bumubukas sa mismong lugar nito, masusundan gamit ang mga HTTP Range request.
- Mga download na dumadaloy, may live na progreso at pagkansela.
- Pindutin ang `/` para mag-filter.

### Configuration, walang YAML

- **Ang buong configuration ng server** — 65 kontrol na may tipo at na-validate sa Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, at SRT.
- **Path defaults at override kada path**, sa mismong saklaw kung saan ito inihahain ng MediaMTX. Ang pag-save ng stream na sakop ng wildcard ay sumusulat ng payak na entry, kaya patuloy na nagmamana ang mga key na hindi mo ginalaw.
- **Lahat ng 15 `runOn*` hook**, may babala kung saan nagre-restart ng path ang pag-save.
- **Payak na pagsulat** — ang mga key lang na binago mo.

### Operasyon

Iisang proseso para sa API, SPA, at media · multi-arch · `GET /health` · nakabalangkas na log · PWA · maliwanag at madilim · 30 wika · walang database.

## Mga environment variable

Para lang ito sa unang boot. Ang iba ay nananatiling nababago sa ilalim ng **Config**.

| Variable | Default | Layunin |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Kung saan naaabot ng Connect ang MediaMTX API mula sa loob ng container nito |
| `MEDIAMTX_API_PORT` | `9997` | Port ng MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Path sa host na naka-mount para sa mga recording (compose lang) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kung saan itinatago ang mga thumbnail |

Ang `http://mediamtx` ay nareresolba lang sa network ng kasamang compose — para sa nag-iisang `docker run`, ituro ito sa sarili mong host.

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

Mula sa browser patungong MediaMTX ang playback. JSON lang ang inililipat ng Connect, saka ang mga recording at thumbnail na binabasa nito sa disk.

## Dokumentasyon

| | |
|---|---|
| [Mga tampok](../FEATURES.md) | Bawat kakayahan, ruta, at procedure na nailabas na |
| [Arkitektura](../../ARCHITECTURE.md) | Kung paano nagkakasya ang mga piyesa |
| [Pag-ambag](../../CONTRIBUTING.md) | Setup sa dev, mga script, proseso ng PR |
| [Mga halimbawa](../../examples/) | Kamera sa Raspberry Pi, pekeng stream para sa pagsubok |

## Pag-ambag

Malugod na tinatanggap ang mga issue at PR. Ang `pnpm install && pnpm dev` ay nagbibigay ng buong stack na may seeded na datos — tingnan ang [CONTRIBUTING.md](../../CONTRIBUTING.md), at tandaan na ang mga pamagat ng PR ay conventional commits. Sinusunod namin ang isang [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Lisensya

[MIT](../../LICENSE)
