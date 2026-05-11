<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <a href="./README.md">English</a> •
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
  🇹🇷 <strong>Türkçe</strong> •
  🇳🇱 <a href="./README.nl.md">Nederlands</a> •
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a> için bir web arayüzü. Akışları izleyin, kayıtlara göz atın ve yapılandırmayı tarayıcıdan düzenleyin.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src=".github/assets/demo.gif" alt="MediaMTX Connect demosu" width="720">
</p>

## Nasıl çalıştırılır

MediaMTX zaten çalışıyor mu? Yanına Connect'i ekleyin:

```bash
docker run -d \
  -p 3000:3000 \
  -v /kayit/yolu:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Henüz MediaMTX yok mu? Birlikte gelen compose ikisini de başlatır:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000 adresini açın, **Config** bölümüne gidin ve MediaMTX'inize yönlendirin.

> Connect, `mediamtx.yml` dosyanızda `api: yes` ayarına ihtiyaç duyar. Çalışan bir referans için [birlikte verilen dosyaya](mediamtx.yml) bakın.

## Belgeler

[Mimari](ARCHITECTURE.md) · [Özellikler](docs/FEATURES.md) · [Katkıda bulunma](CONTRIBUTING.md)

> Not: Geliştirici belgeleri yalnızca İngilizce olarak tutulur. Uygulama arayüzü `/tr` altında Türkçe olarak sunulur.

## Lisans

MIT
