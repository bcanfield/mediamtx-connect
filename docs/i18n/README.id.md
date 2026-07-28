<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Antarmuka web untuk <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Tonton siaran langsung, telusuri rekaman, ubah setiap kunci konfigurasi — dari peramban.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — kisi siaran langsung, penjelajah rekaman, dan editor konfigurasi" width="860">

<details>
<summary>🌍 Baca dalam 30 bahasa</summary>
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
  🇮🇩 <strong>Bahasa Indonesia</strong> •
  🇷🇴 <a href="./README.ro.md">Română</a> •
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

## Apa ini

MediaMTX adalah server streaming yang sangat baik tanpa antarmuka. Connect adalah front-end yang hilang itu: satu kontainer yang berbicara dengan API MediaMTX dan mengubahnya menjadi dinding kamera, arsip rekaman, dan editor konfigurasi.

Ini pendamping, bukan pengganti. Setiap layar bersandar pada sesuatu yang sudah diekspos MediaMTX: sebuah path, sebuah endpoint API, sebuah hook `runOn*`, sebuah protokol yang ia layani secara native. Tidak menyimpan video, tidak memproksi media, tidak memakai basis data.

## Mulai cepat

Image multi-arsitektur (`linux/amd64`, `linux/arm64`) — Docker mengunduh yang tepat.

**Sudah menjalankan MediaMTX?** Tambahkan Connect di sebelahnya:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Mulai dari nol?** Compose bawaan menyalakan keduanya:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Lalu buka <http://localhost:3000>.

> [!IMPORTANT]
> Connect memerlukan `api: yes` pada `mediamtx.yml` Anda. [Konfigurasi bawaan](../../mediamtx.yml) langsung berfungsi.

## Apa yang Anda dapat

### Tampilan langsung

Setiap path yang dikenal MediaMTX, dalam kisi 2 sampai 4 kolom.

- **WebRTC atau HLS, per kartu.** `AUTO` turun ke HLS tanpa ribut, `LOW-LAT` memaksa WebRTC, `COMPAT` mengunci HLS — dan tiap kartu melaporkan transport yang benar-benar didapat.
- **Cuplikan saat menganggur.** Sebuah tugas latar menyimpan bingkai terbaru di setiap kartu, lengkap dengan usianya pada label.
- **Telemetri langsung.** Kodek, jumlah penonton, dan lama tayang, langsung dari daftar path.
- **Status perekaman yang jujur.** Kartu menunjukkan apakah sebuah stream *benar-benar* merekam; status yang gagal dibaca Connect disebut tidak diketahui, bukan mati.
- **URL publikasi ke papan klip.** RTSP, RTMP, dan SRT, dibangun dari alamat listen milik server sendiri.

### Rekaman

- MP4 tiap stream, dikelompokkan per hari, dengan gambar mini otomatis.
- Pemutar yang mengembang di tempat, bisa digeser lewat permintaan HTTP Range.
- Unduhan mengalir, dengan kemajuan langsung dan pembatalan.
- Tekan `/` untuk menyaring.

### Konfigurasi, tanpa YAML

- **Seluruh konfigurasi server** — 65 kendali bertipe dan tervalidasi di Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, dan SRT.
- **Path defaults dan override per path**, pada cakupan tempat MediaMTX menyajikannya. Menyimpan stream yang tercakup wildcard menulis entri renggang, sehingga kunci yang tak disentuh tetap mewarisi.
- **Ke-15 hook `runOn*`**, dengan peringatan di tempat penyimpanan memicu restart path.
- **Penulisan renggang** — hanya kunci yang Anda ubah.

### Operasional

Satu proses untuk API, SPA, dan media · multi-arsitektur · `GET /health` · log terstruktur · PWA · terang dan gelap · 30 bahasa · tanpa basis data.

## Variabel lingkungan

Hanya mengisi boot pertama. Selebihnya tetap bisa diubah lewat **Config**.

| Variabel | Bawaan | Kegunaan |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Tempat Connect menjangkau API MediaMTX dari dalam kontainernya |
| `MEDIAMTX_API_PORT` | `9997` | Porta API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Jalur host yang dipasang untuk rekaman (khusus compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Tempat gambar mini disimpan |

`http://mediamtx` hanya bisa diselesaikan di jaringan compose bawaan — untuk `docker run` mandiri, arahkan ke host Anda.

## Cara kerjanya

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

Pemutaran berjalan dari peramban ke MediaMTX. Connect hanya memindahkan JSON, ditambah rekaman dan gambar mini yang ia baca dari disk.

## Dokumentasi

| | |
|---|---|
| [Fitur](../FEATURES.md) | Setiap kemampuan, rute, dan prosedur yang sudah dirilis |
| [Arsitektur](../../ARCHITECTURE.md) | Bagaimana bagian-bagiannya menyatu |
| [Berkontribusi](../../CONTRIBUTING.md) | Penyiapan dev, skrip, proses PR |
| [Contoh](../../examples/) | Kamera Raspberry Pi, stream palsu untuk pengujian |

## Berkontribusi

Issue dan PR sangat diterima. `pnpm install && pnpm dev` memberi Anda stack lengkap beserta data contoh — lihat [CONTRIBUTING.md](../../CONTRIBUTING.md), dan perhatikan bahwa judul PR memakai conventional commits. Kami mengikuti [Kode Etik](../../CODE_OF_CONDUCT.md).

## Lisensi

[MIT](../../LICENSE)
