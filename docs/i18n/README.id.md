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

<h4 align="center">Antarmuka web untuk <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Tonton aliran, telusuri rekaman, dan ubah konfigurasi dari peramban Anda.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Demo MediaMTX Connect" width="720">
</p>

## Cara menjalankan

Image diterbitkan untuk `linux/amd64` maupun `linux/arm64` (Raspberry Pi, Apple Silicon, dll.) — Docker mengunduh yang sesuai secara otomatis.

Sudah menjalankan MediaMTX? Tambahkan Connect di sampingnya:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /jalur/ke/rekaman:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` adalah alamat tempat Connect menjangkau API MediaMTX dari *dalam* kontainernya. Nilai bawaannya `http://mediamtx`, yang hanya bisa diselesaikan di jaringan compose bawaan — untuk `docker run` mandiri, arahkan ke host MediaMTX Anda (Anda juga bisa mengubahnya nanti di **Config**).

Belum punya MediaMTX? Compose yang disertakan menjalankan keduanya:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Buka http://localhost:3000, ke **Config**, dan arahkan ke MediaMTX Anda.

> Connect membutuhkan `api: yes` di `mediamtx.yml` Anda. Lihat [file yang disertakan](../../mediamtx.yml) sebagai referensi yang berfungsi.

### Konfigurasi

Semuanya dapat dikonfigurasi saat aplikasi berjalan di **Config**. Variabel lingkungan ini hanya dipakai pada boot pertama:

| Variabel | Bawaan | Kegunaan |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Host API MediaMTX, yang dapat dijangkau dari kontainer Connect |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Jalur host yang di-mount untuk rekaman (hanya compose; opsional — memakai nilai bawaan jika tidak diatur) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Tempat penyimpanan tangkapan layar yang dihasilkan |

## Dokumentasi

[Arsitektur](../../ARCHITECTURE.md) · [Fitur](../../docs/FEATURES.md) · [Berkontribusi](../../CONTRIBUTING.md)

> Catatan: dokumentasi untuk pengembang hanya tersedia dalam bahasa Inggris. UI aplikasi tersedia dalam Bahasa Indonesia di `/id`.

## Kode Etik

Proyek ini mengikuti sebuah [Kode Etik](../../CODE_OF_CONDUCT.md). Dengan berpartisipasi, Anda diharapkan untuk mematuhinya.

## Lisensi

MIT
