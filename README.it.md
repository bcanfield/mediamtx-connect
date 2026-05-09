<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <a href="./README.md">English</a> · <a href="./README.es.md">Español</a> · <a href="./README.zh.md">中文</a> · <strong>Italiano</strong> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.pl.md">Polski</a></p>
  <p>Un'interfaccia web per <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Guarda i flussi, sfoglia le registrazioni e modifica la configurazione dal browser.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Demo di MediaMTX Connect" width="720">
</div>

## Come eseguirlo

Hai già MediaMTX in esecuzione? Aggiungi Connect al suo fianco:

```bash
docker run -d \
  -p 3000:3000 \
  -v /percorso/delle/registrazioni:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Non hai ancora MediaMTX? Il compose incluso avvia entrambi:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Apri http://localhost:3000, vai su **Config** e puntalo al tuo MediaMTX.

> Connect richiede `api: yes` nel tuo `mediamtx.yml`. Vedi [il file incluso](mediamtx.yml) come riferimento funzionante.

## Documentazione

[Architettura](ARCHITECTURE.md) · [Funzionalità](docs/FEATURES.md) · [Contribuire](CONTRIBUTING.md)

> Nota: la documentazione per sviluppatori è mantenuta solo in inglese. L'interfaccia dell'applicazione è disponibile in italiano su `/it`.

## Licenza

MIT
