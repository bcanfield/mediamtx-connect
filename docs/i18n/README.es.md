<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>La interfaz web para <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Mira transmisiones en vivo, explora grabaciones y edita cualquier clave de configuración — desde tu navegador.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — mosaico de transmisiones en vivo, explorador de grabaciones y editor de configuración" width="860">

<details>
<summary>🌍 Léelo en 30 idiomas</summary>
<p>
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
</details>

</div>

## Qué es

MediaMTX es un gran servidor de streaming sin interfaz. Connect es el front-end que le falta: un contenedor que habla con la API de MediaMTX y la convierte en un muro de cámaras, un archivo de grabaciones y un editor de configuración.

Es un complemento, no un reemplazo. Cada pantalla se apoya en algo que MediaMTX ya expone: una ruta, un endpoint, un hook `runOn*`, un protocolo que sirve de forma nativa. No almacena vídeo, no hace de proxy, no usa base de datos.

## Inicio rápido

Imágenes multiarquitectura (`linux/amd64`, `linux/arm64`) — Docker descarga la correcta.

**¿Ya tienes MediaMTX?** Añade Connect junto a él:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**¿Empiezas de cero?** El compose incluido levanta ambos:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Luego abre <http://localhost:3000>.

> [!IMPORTANT]
> Connect necesita `api: yes` en tu `mediamtx.yml`. La [configuración incluida](../../mediamtx.yml) funciona tal cual.

## Qué obtienes

### Vista en vivo

Todas las rutas que MediaMTX conoce, en una rejilla de 2 a 4 columnas.

- **WebRTC o HLS, por tarjeta.** `AUTO` cae a HLS en silencio, `LOW-LAT` exige WebRTC y `COMPAT` fuerza HLS — y cada tarjeta informa del transporte que realmente consiguió.
- **Capturas mientras está inactiva.** Un trabajo en segundo plano mantiene un fotograma reciente en cada tarjeta, con su antigüedad en la etiqueta.
- **Telemetría en vivo.** Códecs, espectadores y tiempo en línea, directos del listado de rutas.
- **Estado de grabación honesto.** Las tarjetas muestran si una transmisión graba *de verdad*; un estado que Connect no pudo leer dice desconocido, nunca apagado.
- **URLs de publicación al portapapeles.** RTSP, RTMP y SRT, construidas desde las direcciones de escucha del propio servidor.

### Grabaciones

- Los MP4 de cada transmisión, agrupados por día y con miniaturas automáticas.
- Un reproductor que se despliega en su sitio, navegable mediante peticiones HTTP Range.
- Descargas en streaming, con progreso en vivo y cancelación.
- Pulsa `/` para filtrar.

### Configuración, sin YAML

- **Toda la configuración del servidor** — 65 controles tipados y validados en Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC y SRT.
- **Valores por defecto y anulaciones por ruta**, en los ámbitos desde los que MediaMTX los sirve. Guardar una transmisión cubierta por un comodín escribe una entrada dispersa, así que las claves intactas siguen heredando.
- **Los 15 hooks `runOn*`**, con aviso allí donde guardar reinicia la ruta.
- **Escrituras dispersas** — solo las claves que cambiaste.

### Operación

Un proceso para API, SPA y medios · multiarquitectura · `GET /health` · logs estructurados · PWA · claro y oscuro · 30 idiomas · sin base de datos.

## Variables de entorno

Estas siembran el primer arranque. Todo sigue siendo editable en **Config**.

| Variable | Por defecto | Para qué sirve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dónde alcanza Connect la API de MediaMTX desde dentro de su contenedor |
| `MEDIAMTX_API_PORT` | `9997` | Puerto de la API de MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Ruta del host montada para grabaciones (solo compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dónde se guardan las miniaturas |

`http://mediamtx` solo resuelve en la red del compose incluido — para un `docker run` independiente, apúntalo a tu host.

## Cómo funciona

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

La reproducción va del navegador a MediaMTX. Connect solo mueve JSON, más las grabaciones y miniaturas que lee del disco.

## Documentación

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Cada capacidad, ruta y procedimiento publicado |
| [Arquitectura](../../ARCHITECTURE.md) | Cómo encajan las piezas |
| [Contribuir](../../CONTRIBUTING.md) | Entorno de desarrollo, scripts, proceso de PR |
| [Ejemplos](../../examples/) | Cámara de Raspberry Pi, transmisiones falsas para pruebas |

## Contribuir

Issues y PR son bienvenidos. `pnpm install && pnpm dev` levanta el stack completo con datos de prueba — mira [CONTRIBUTING.md](../../CONTRIBUTING.md), y ten en cuenta que los títulos de PR son conventional commits. Seguimos un [Código de Conducta](../../CODE_OF_CONDUCT.md).

## Licencia

[MIT](../../LICENSE)
