<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <strong>Español</strong> •
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
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center">Una interfaz web para <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Mira transmisiones, explora grabaciones y edita la configuración desde tu navegador.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Demostración de MediaMTX Connect" width="720">
</p>

## Cómo ejecutarlo

Se publican imágenes tanto para `linux/amd64` como para `linux/arm64` (Raspberry Pi, Apple Silicon, etc.) — Docker descarga la correcta automáticamente.

¿Ya tienes MediaMTX en marcha? Añade Connect junto a él:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /ruta/a/grabaciones:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` es la dirección donde Connect alcanza la API de MediaMTX desde *dentro* de su contenedor. Su valor por defecto es `http://mediamtx`, que solo se resuelve en la red del compose incluido — para un `docker run` independiente, apúntalo a tu host de MediaMTX (también puedes cambiarlo más tarde en **Configuración**).

¿Aún no tienes MediaMTX? El compose incluido inicia ambos:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Abre http://localhost:3000, ve a **Configuración** y apúntalo a tu MediaMTX.

> Connect necesita `api: yes` en tu `mediamtx.yml`. Consulta [el archivo incluido](../../mediamtx.yml) como referencia funcional.

### Configuración

Todo es configurable en tiempo de ejecución desde **Configuración**. Estas variables de entorno solo se usan en el primer arranque:

| Variable | Valor por defecto | Propósito |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Host de la API de MediaMTX, accesible desde el contenedor de Connect |
| `MEDIAMTX_API_PORT` | `9997` | Puerto de la API de MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Ruta del host montada para las grabaciones (solo compose; opcional — usa el valor por defecto si no se define) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dónde se almacenan las capturas generadas |

## Documentación

[Arquitectura](../../ARCHITECTURE.md) · [Funcionalidades](../../docs/FEATURES.md) · [Contribuir](../../CONTRIBUTING.md)

> Nota: la documentación para desarrolladores se mantiene en inglés. La interfaz de la aplicación está disponible en español en `/es`.

## Código de Conducta

Este proyecto sigue un [Código de Conducta](../../CODE_OF_CONDUCT.md). Al participar, se espera que lo respetes.

## Licencia

MIT
