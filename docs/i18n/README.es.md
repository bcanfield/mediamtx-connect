<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>La interfaz web para <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Mira transmisiones en vivo, explora grabaciones y edita la configuración de MediaMTX desde el navegador.</p>

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

Es un complemento, no un reemplazo. Cada pantalla se apoya en algo que MediaMTX ya expone: una ruta, un endpoint de la API, un hook `runOn*`, un protocolo que sirve de forma nativa. No almacena vídeo, no hace de proxy de medios, no usa base de datos.

## Inicio rápido

Imágenes multiarquitectura (`linux/amd64`, `linux/arm64`); Docker descarga la correcta.

**¿Ya tienes MediaMTX en marcha?** Añade Connect junto a él:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -e REMOTE_MEDIAMTX_URL=http://<host-your-browser-uses> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  -v mediamtx-connect-screenshots:/screenshots \
  bcanfield/mediamtx-connect:latest
```

**¿Empiezas de cero?** El compose incluido construye Connect y lo ejecuta junto a MediaMTX:

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

- **WebRTC o HLS, por tarjeta.** `AUTO` recurre a la alternativa en silencio, `LOW-LAT` exige WebRTC y `COMPAT` fuerza HLS. Cada tarjeta informa del transporte que realmente consiguió.
- **Capturas mientras está inactiva.** Un trabajo en segundo plano mantiene un fotograma reciente en cada tarjeta, con su antigüedad en la etiqueta. ¿Necesitas una nueva ya? Tómala desde el menú de la tarjeta.
- **Telemetría en vivo.** Códecs, espectadores y tiempo en línea, directos del listado de rutas.
- **Estado de grabación honesto.** Las tarjetas muestran si una transmisión graba *de verdad*; un estado que Connect no pudo leer dice desconocido, nunca apagado.
- **URLs de publicación al portapapeles.** RTSP, RTMP y SRT, construidas desde las direcciones de escucha del propio servidor. La página de cada ruta va más allá con un panel de publicación y lectura: todos los protocolos que sirve el servidor, incluidos WHIP, WHEP, HLS y las variantes TLS, con fragmentos listos para copiar para ffmpeg, GStreamer, OBS, ffplay y VLC.

### Grabaciones

- Una línea de tiempo diaria por transmisión, desde el servidor de reproducción de MediaMTX: los tramos grabados y los huecos entre ellos, cada uno reproducible. Si la reproducción está desactivada, Connect enumera los cambios de configuración exactos que necesita y los aplica con un clic.
- Descarga de clips: cualquier intervalo de hasta una hora (o los últimos 5 min, 15 min o la última hora) como un único MP4 normal, unido a través de los segmentos por MediaMTX sin recodificar.
- Segmentos MP4 o MPEG-TS de cada transmisión, agrupados por día y con miniaturas automáticas.
- Un reproductor integrado que se despliega en su sitio, navegable mediante peticiones HTTP Range.
- Descargas en streaming, con progreso en vivo y cancelación.
- Pulsa `/` para filtrar.

### Sesiones

- **Todos los conectados, en una tabla.** Publicadores y lectores por RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC y HLS, con dirección remota, bytes de entrada y salida y tiempo en línea, actualizados cada 5 segundos.
- **Expulsa a un cliente** tras una confirmación. Puede volver a conectarse; una expulsión no es un bloqueo.

### Configuración, sin YAML

- **La configuración del servidor:** 66 controles tipados y validados en Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC y SRT.
- **Valores por defecto de ruta y anulaciones por ruta**, en los ámbitos desde los que MediaMTX los sirve. Guardar una transmisión cubierta por un comodín escribe una entrada dispersa, así que las claves intactas siguen los valores por defecto.
- **Un catálogo de rutas** con insignias de en vivo y regex, un formulario guiado para "añadir una cámara RTSP", y la opción de revertir o eliminar la entrada propia de cualquier ruta (con un aviso si hay alguien conectado).
- **Salud en vivo en la página de cada ruta:** pistas, lectores, bytes transferidos, fotogramas con error y tiempo en línea, actualizados cada 5 segundos. Una ruta sin nada publicando aparece inactiva, no averiada.
- **Resiliencia en cada ruta:** una alternativa siempre disponible que reproduce en bucle un clip de "sin conexión" mientras la cámara está caída, y extracción bajo demanda que solo abre la fuente mientras alguien la ve.
- **Todos los hooks `runOn*`**, con aviso allí donde guardar reinicia la ruta.
- **Reenvío:** envía una ruta a YouTube, Twitch u otro servidor mediante la lista nativa `forward` de MediaMTX, con las claves de transmisión ocultas y sin reiniciar la ruta.
- **Escrituras dispersas.** Solo se envían las claves que cambiaste.

### Operación

Un proceso para API, SPA y medios · multiarquitectura · `GET /api/health` · versión de MediaMTX en la cabecera · logs estructurados · instalable como PWA · claro y oscuro · 30 idiomas · sin base de datos.

## Variables de entorno

Estas siembran el primer arranque. Todo sigue siendo editable en **Config**.

| Variable | Por defecto en la imagen | Para qué sirve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dónde alcanza Connect la API de MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Puerto de la API de MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Dónde alcanza el *navegador* a MediaMTX para reproducir. Configúrala siempre que el navegador no esté en el servidor |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Dónde lee Connect las grabaciones |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dónde se guardan capturas y miniaturas |
| `DATA_DIR` | `/data` | Dónde vive `config.json` |
| `PORT` | `3000` | Puerto HTTP |
| `LOG_LEVEL` | `info` | Nivel de log de Pino |

`http://mediamtx` solo resuelve en la red del compose incluido. Para un `docker run` independiente, apúntalo a tu host. Con compose, define `REMOTE_MEDIAMTX_HOST` en `.env` en lugar de `REMOTE_MEDIAMTX_URL`: también fija el host WebRTC que anuncia MediaMTX. [`.env.example`](../../.env.example) explica cada una, y `pnpm dev` usa valores por defecto de localhost sin ningún `.env`.

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

La reproducción en vivo va del navegador a MediaMTX. Connect mueve JSON, más las grabaciones y miniaturas: desde el disco, o tramos grabados que pasa como proxy desde el servidor de reproducción de MediaMTX.

## Documentación

| | |
|---|---|
| [Funcionalidades](../../docs/FEATURES.md) | Cada capacidad, ruta y procedimiento publicado |
| [Arquitectura](../../docs/ARCHITECTURE.md) | Cómo encajan las piezas |
| [Contribuir](../../CONTRIBUTING.md) | Entorno de desarrollo, scripts, proceso de PR |
| [Ejemplos](../../examples/) | Cámara de Raspberry Pi, transmisiones falsas para pruebas |

## Contribuir

Issues y PR son bienvenidos. `pnpm install && pnpm dev` levanta el stack completo con datos de prueba. Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md), y ten en cuenta que los títulos de PR son conventional commits. Seguimos un [Código de Conducta](../../CODE_OF_CONDUCT.md).

## Licencia

[MIT](../../LICENSE)
