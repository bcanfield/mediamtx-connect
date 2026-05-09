<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <a href="./README.md">English</a> · <strong>Español</strong> · <a href="./README.zh.md">中文</a> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.pl.md">Polski</a></p>
  <p>Una interfaz web para <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Mira transmisiones, explora grabaciones y edita la configuración desde tu navegador.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Demostración de MediaMTX Connect" width="720">
</div>

## Cómo ejecutarlo

¿Ya tienes MediaMTX en marcha? Añade Connect junto a él:

```bash
docker run -d \
  -p 3000:3000 \
  -v /ruta/a/grabaciones:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

¿Aún no tienes MediaMTX? El compose incluido inicia ambos:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Abre http://localhost:3000, ve a **Configuración** y apúntalo a tu MediaMTX.

> Connect necesita `api: yes` en tu `mediamtx.yml`. Consulta [el archivo incluido](mediamtx.yml) como referencia funcional.

## Documentación

[Arquitectura](ARCHITECTURE.md) · [Funcionalidades](docs/FEATURES.md) · [Contribuir](CONTRIBUTING.md)

> Nota: la documentación para desarrolladores se mantiene en inglés. La interfaz de la aplicación está disponible en español en `/es`.

## Licencia

MIT
