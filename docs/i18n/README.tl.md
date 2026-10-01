<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Ang web UI para sa <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Manood ng live na stream, mag-browse ng mga recording, at i-edit ang config ng MediaMTX mo mula sa browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grid ng live na stream, browser ng recording, at editor ng config" width="860">

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

Napakagaling na streaming server ang MediaMTX, pero walang kasamang UI. Ang Connect ang nawawalang front end: isang container na kausap ang API ng MediaMTX at ginagawa itong pader ng kamera, archive ng recording, at editor ng config.

Kasama ito, hindi kapalit. Bawat screen ay tumutugma sa isang bagay na inilalantad na ng MediaMTX: isang path, isang API endpoint, isang `runOn*` hook, isang protocol na siya mismo ang naghahain. Walang iniimbak na video, walang pinoproxy na media, walang database.

## Mabilisang simula

Mga multi-arch na image (`linux/amd64`, `linux/arm64`); ang Docker na ang kukuha ng tama.

**Tumatakbo na ang MediaMTX?** Itabi mo lang ang Connect:

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

**Magsisimula mula sa wala?** Binubuo ng kasamang compose ang Connect at pinapatakbo ito katabi ng MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Pagkatapos ay buksan ang <http://localhost:3000>.

> [!IMPORTANT]
> Kailangan ng Connect ang `api: yes` sa `mediamtx.yml` mo. Gumagana agad ang [kasamang config](../../mediamtx.yml).

## Ano ang makukuha mo

### Live na tanawin

Bawat path na kilala ng MediaMTX, sa grid na 2 hanggang 4 na hanay.

- **WebRTC o HLS, bawat card.** Tahimik na bumabagsak sa HLS ang `AUTO`, ipinipilit ng `LOW-LAT` ang WebRTC, at pinipilit ng `COMPAT` ang HLS. Iniuulat ng bawat card ang transport na talagang nakuha nito.
- **May snapshot kahit tahimik.** May background job na nagtatago ng kamakailang frame sa bawat card, kasama ang edad nito sa pill. Kailangan mo ng bago ngayon din? Kumuha mula sa menu ng card.
- **Live na telemetry.** Mga codec, bilang ng manonood, at uptime, diretso mula sa listahan ng path.
- **Tapat na katayuan ng recording.** Ipinapakita ng mga card kung *talagang* nagre-record ang isang stream; ang katayuang hindi nabasa ng Connect ay tinatawag na hindi tiyak, hindi kailanman naka-off.
- **Mga publish URL sa clipboard.** RTSP, RTMP, at SRT, binuo mula sa sariling listen address ng server. Mas malayo pa ang pahina ng bawat path dahil may panel ito para sa publish at read: bawat protocol na inihahain ng server, kasama ang WHIP, WHEP, HLS at ang mga TLS na bersyon, na may mga snippet para sa ffmpeg, GStreamer, OBS, ffplay at VLC na handang kopyahin.

### Mga recording

- Timeline ng isang araw kada stream mula sa playback server ng MediaMTX: ang mga naka-record na bahagi at ang mga puwang sa pagitan nila, na bawat isa ay napapatugtog. Kung naka-off ang playback, inililista ng Connect ang eksaktong mga pagbabago sa config na kailangan nito at inilalapat ang mga ito sa isang click.
- Pag-download ng clip: kahit anong saklaw hanggang isang oras (o ang huling 5 min, 15 min o isang oras) bilang isang simpleng MP4, pinagdugtong ng MediaMTX mula sa mga segment nang walang re-encoding.
- Mga MP4 o MPEG-TS na segment kada stream, nakagrupo kada araw, may awtomatikong thumbnail.
- Isang inline na player na bumubukas sa mismong lugar nito, masusundan gamit ang mga HTTP range request.
- Mga download na dumadaloy, may live na progreso at pagkansela.
- Pindutin ang `/` para mag-filter.

### Mga session

- **Lahat ng nakakonekta, sa iisang talahanayan.** Mga publisher at reader sa RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC at HLS, may remote address, bytes na pumasok at lumabas, at uptime, nire-refresh kada 5 segundo.
- **Mag-kick ng client** matapos kumpirmahin. Puwede itong kumonekta ulit; hindi ban ang kick.

### Configuration, walang YAML

- **Ang config ng server:** 66 na kontrol na may tipo at na-validate sa Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC, at SRT.
- **Path defaults at override kada path**, sa mismong saklaw kung saan ito inihahain ng MediaMTX. Ang pag-save ng stream na sakop ng wildcard ay sumusulat ng payak na entry, kaya patuloy na sinusundan ng mga key na hindi mo ginalaw ang mga default.
- **Isang katalogo ng path** na may badge para sa live at regex, isang gabay na form para "magdagdag ng RTSP na kamera", at revert o delete para sa sariling entry ng kahit anong path (may babala kung may nakakonekta).
- **Live na kalusugan sa pahina ng bawat path:** mga track, reader, bytes na nailipat, mga frame na may error at uptime, nire-refresh kada 5 segundo. Ang path na walang nagpa-publish ay idle ang basa, hindi sira.
- **Katatagan sa bawat path:** isang laging-handang fallback na umuulit ng offline na clip habang patay ang kamera, at on-demand na paghila na binubuksan lang ang source habang may nanonood.
- **Bawat `runOn*` hook**, may babala kung saan nagre-restart ng path ang pag-save.
- **Forwarding:** itulak ang isang path sa YouTube, Twitch o ibang server gamit ang katutubong `forward` na listahan ng MediaMTX, nakatago ang mga stream key at walang restart ng path.
- **Payak na pagsulat.** Ang mga key lang na binago mo ang ipinapadala.

### Operasyon

Iisang proseso para sa API, SPA, at media · multi-arch · `GET /api/health` · bersyon ng MediaMTX sa header · nakabalangkas na log · nai-install bilang PWA · madilim at maliwanag · 30 wika · walang database.

## Mga environment variable

Para ito sa unang boot. Nananatiling nababago ang lahat sa ilalim ng **Config**.

| Variable | Default sa image | Layunin |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Kung saan naaabot ng Connect ang MediaMTX API |
| `MEDIAMTX_API_PORT` | `9997` | Port ng MediaMTX API |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Kung saan naaabot ng *browser* ang MediaMTX para sa playback. Itakda ito tuwing wala sa server ang browser |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Kung saan binabasa ng Connect ang mga recording |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kung saan napupunta ang mga snapshot at thumbnail |
| `DATA_DIR` | `/data` | Kung saan nakatira ang `config.json` |
| `PORT` | `3000` | HTTP port |
| `LOG_LEVEL` | `info` | Antas ng log ng Pino |

Ang `http://mediamtx` ay nareresolba lang sa network ng kasamang compose. Para sa nag-iisang `docker run`, ituro ito sa host mo. Sa compose, itakda ang `REMOTE_MEDIAMTX_HOST` sa `.env` sa halip na `REMOTE_MEDIAMTX_URL`: itinatakda rin nito ang WebRTC host na ina-advertise ng MediaMTX. Ipinapaliwanag ng [`.env.example`](../../.env.example) ang bawat isa, at gumagamit ang `pnpm dev` ng mga default na localhost nang walang `.env` kahit kailan.

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

Mula sa browser patungong MediaMTX ang live na playback. JSON ang inililipat ng Connect, kasama ang mga recording at thumbnail: mula sa disk, o mga naka-record na bahaging pinoproxy mula sa playback server ng MediaMTX.

## Dokumentasyon

| | |
|---|---|
| [Mga tampok](../../docs/FEATURES.md) | Bawat kakayahan, ruta, at procedure na nailabas na |
| [Arkitektura](../../docs/ARCHITECTURE.md) | Kung paano nagkakasya ang mga piyesa |
| [Pag-ambag](../../CONTRIBUTING.md) | Setup sa dev, mga script, proseso ng PR |
| [Mga halimbawa](../../examples/) | Kamera sa Raspberry Pi, pekeng stream para sa pagsubok |

## Pag-ambag

Malugod na tinatanggap ang mga issue at PR. Ang `pnpm install && pnpm dev` ay nagbibigay sa iyo ng buong stack na may mga fixture. Tingnan ang [CONTRIBUTING.md](../../CONTRIBUTING.md), at tandaan na ang mga pamagat ng PR ay conventional commits. Sinusunod namin ang isang [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Lisensya

[MIT](../../LICENSE)
