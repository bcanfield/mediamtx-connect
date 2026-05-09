<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <strong>English</strong> · <a href="./README.es.md">Español</a> · <a href="./README.zh.md">中文</a> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.pl.md">Polski</a> · <a href="./README.ko.md">한국어</a></p>
  <p>A web UI for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Watch streams, browse recordings, and edit config from your browser.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="MediaMTX Connect demo" width="720">
</div>

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
