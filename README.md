<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <strong>English</strong> •
  🇪🇸 <a href="./docs/i18n/README.es.md">Español</a> •
  🇨🇳 <a href="./docs/i18n/README.zh.md">中文</a> •
  🇮🇹 <a href="./docs/i18n/README.it.md">Italiano</a> •
  🇩🇪 <a href="./docs/i18n/README.de.md">Deutsch</a> •
  🇷🇺 <a href="./docs/i18n/README.ru.md">Русский</a> •
  🇫🇷 <a href="./docs/i18n/README.fr.md">Français</a> •
  🇵🇹 <a href="./docs/i18n/README.pt.md">Português</a> •
  🇯🇵 <a href="./docs/i18n/README.ja.md">日本語</a> •
  🇵🇱 <a href="./docs/i18n/README.pl.md">Polski</a> •
  🇰🇷 <a href="./docs/i18n/README.ko.md">한국어</a> •
  🇹🇷 <a href="./docs/i18n/README.tr.md">Türkçe</a> •
  🇳🇱 <a href="./docs/i18n/README.nl.md">Nederlands</a> •
  🇨🇿 <a href="./docs/i18n/README.cs.md">Čeština</a> •
  🇹🇼 <a href="./docs/i18n/README.zh-tw.md">繁體中文</a> •
  🇧🇷 <a href="./docs/i18n/README.pt-br.md">Português (BR)</a> •
  🇮🇩 <a href="./docs/i18n/README.id.md">Bahasa Indonesia</a> •
  🇷🇴 <a href="./docs/i18n/README.ro.md">Română</a> •
  🇸🇪 <a href="./docs/i18n/README.sv.md">Svenska</a> •
  🇩🇰 <a href="./docs/i18n/README.da.md">Dansk</a> •
  🇳🇴 <a href="./docs/i18n/README.no.md">Norsk</a> •
  🇫🇮 <a href="./docs/i18n/README.fi.md">Suomi</a> •
  🇬🇷 <a href="./docs/i18n/README.el.md">Ελληνικά</a> •
  🇭🇺 <a href="./docs/i18n/README.hu.md">Magyar</a> •
  🇺🇦 <a href="./docs/i18n/README.uk.md">Українська</a> •
  🇻🇳 <a href="./docs/i18n/README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./docs/i18n/README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./docs/i18n/README.th.md">ไทย</a> •
  🇮🇳 <a href="./docs/i18n/README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./docs/i18n/README.bn.md">বাংলা</a>
</p>

<h4 align="center">A web UI for <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Watch streams, browse recordings, and edit config from your browser.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src=".github/assets/demo.gif" alt="MediaMTX Connect demo" width="720">
</p>

## Run it

Already running MediaMTX? Add Connect alongside it:

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

No MediaMTX yet? The bundled compose starts both:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Open http://localhost:3000, head to **Config**, and point it at your MediaMTX.

> Connect needs `api: yes` in your `mediamtx.yml`. See [the included one](mediamtx.yml) for a working reference.

## Docs

[Architecture](ARCHITECTURE.md) · [Features](docs/FEATURES.md) · [Contributing](CONTRIBUTING.md)

## License

MIT
