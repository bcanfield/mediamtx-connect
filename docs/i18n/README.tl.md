<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
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

<h4 align="center">Isang web interface para sa <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Manood ng mga stream, mag-browse ng mga recording, at i-edit ang configuration mula sa iyong browser.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Demo ng MediaMTX Connect" width="720">
</p>

## Paano patakbuhin

Ang mga image ay inilalathala para sa `linux/amd64` at `linux/arm64` (Raspberry Pi, Apple Silicon, atbp.) — awtomatikong kinukuha ng Docker ang tama.

May tumatakbo ka nang MediaMTX? Ilagay ang Connect sa tabi nito:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /landas/sa/mga-recording:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

Ang `BACKEND_SERVER_MEDIAMTX_URL` ay kung saan naaabot ng Connect ang API ng MediaMTX mula sa *loob* ng container nito. Ang default nito ay `http://mediamtx`, na nareresolba lamang sa kasamang compose network — para sa isang standalone na `docker run`, itakda ito sa host ng iyong MediaMTX (maaari mo rin itong baguhin mamaya sa ilalim ng **Config**).

Wala pang MediaMTX? Ang kasamang compose ay nagsisimula ng pareho:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Buksan ang http://localhost:3000, pumunta sa **Config**, at ituro ito sa iyong MediaMTX.

> Kailangan ng Connect ng `api: yes` sa iyong `mediamtx.yml`. Tingnan ang [kasamang file](../../mediamtx.yml) bilang gumaganang reference.

### Konfigurasyon

Lahat ay maaaring i-configure habang tumatakbo sa ilalim ng **Config**. Ang mga env var na ito ay naghahasik lamang sa unang boot:

| Variable | Default | Layunin |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Host ng MediaMTX API, naaabot mula sa container ng Connect |
| `MEDIAMTX_API_PORT` | `9997` | Port ng MediaMTX API |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Landas sa host na naka-mount para sa mga recording (compose lamang; opsyonal — may default kung hindi nakatakda) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kung saan itinatago ang mga nabuong screenshot |

## Dokumentasyon

[Arkitektura](../../ARCHITECTURE.md) · [Mga tampok](../../docs/FEATURES.md) · [Mag-ambag](../../CONTRIBUTING.md)

> Tandaan: ang dokumentasyon para sa developer ay nasa English lamang. Available ang UI ng application sa Tagalog sa `/tl`.

## Kodigo ng Pag-uugali

Sinusunod ng proyektong ito ang isang [Kodigo ng Pag-uugali](../../CODE_OF_CONDUCT.md). Sa pakikilahok, inaasahang susundin mo ito.

## Lisensya

MIT
