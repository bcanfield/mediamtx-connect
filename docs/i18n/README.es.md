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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — mosaico de transmisiones en vivo, explorador de grabaciones y editor de configuración" width="860">

</div>

## Qué es

MediaMTX es un excelente servidor de streaming, y viene sin interfaz. Connect es el front-end que le falta: un único contenedor que habla con la API de MediaMTX y la convierte en un muro de cámaras, un archivo de grabaciones y un editor de configuración.

Es un complemento, no un reemplazo. Cada pantalla se apoya en algo que MediaMTX ya expone — una ruta, un endpoint de la API, un hook `runOn*`, un protocolo que sirve de forma nativa. Connect no almacena vídeo, no hace de proxy de medios y no usa base de datos. Apúntalo a un servidor en marcha y funciona.

## Inicio rápido

Se publican imágenes para `linux/amd64` y `linux/arm64` (Raspberry Pi, Apple Silicon y compañía), así que Docker descarga la correcta por ti.

**¿Ya tienes MediaMTX en marcha?** Añade Connect junto a él:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**¿Empiezas desde cero?** El fichero compose incluido levanta ambos:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

En cualquiera de los dos casos, abre <http://localhost:3000>.

> [!IMPORTANT]
> Connect necesita `api: yes` en tu `mediamtx.yml` — esa API es por donde lee y escribe todo. La [configuración incluida](../../mediamtx.yml) sirve de referencia funcional.

## Qué obtienes

### Vista en vivo

Un mosaico con todas las rutas que MediaMTX conoce, a 2, 3 o 4 columnas.

- **WebRTC o HLS, tarjeta a tarjeta.** `AUTO` prefiere WebRTC y cae a HLS en silencio, `LOW-LAT` exige WebRTC y `COMPAT` fuerza HLS. Cada tarjeta negocia su propia conexión e informa del transporte que realmente consiguió — nunca del que pediste.
- **Capturas mientras está inactiva.** Un trabajo en segundo plano toma un fotograma de cada transmisión, así que las tarjetas apagadas siguen mostrando la escena, con la antigüedad del fotograma en la etiqueta. «Tomar captura» genera una al instante.
- **Telemetría en vivo.** Chips de códec, número de espectadores y tiempo en línea, directamente del listado de rutas — sin peticiones extra.
- **Estado de grabación que dice la verdad.** Las tarjetas muestran si una transmisión está grabando *de forma efectiva* (su propia anulación fusionada sobre los valores por defecto de la ruta, tal y como lo resuelve MediaMTX), y un estado que no se pudo leer aparece como desconocido en lugar de como apagado.
- **URLs de publicación al portapapeles.** Destinos RTSP, RTMP y SRT construidos a partir de las direcciones de escucha del propio servidor, de modo que un puerto cambiado sigue siendo el puerto correcto.

### Grabaciones

- Los MP4 de cada transmisión, agrupados por día, del más reciente al más antiguo y con miniaturas generadas automáticamente.
- Un reproductor que se despliega en línea, con una barra de búsqueda real respaldada por peticiones HTTP Range.
- Descargas en streaming con progreso en vivo, velocidad y botón de cancelar.
- Pulsa `/` en cualquier sitio para filtrar.

### Configuración, sin YAML

- **Toda la configuración del servidor** — 65 controles repartidos en Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC y SRT, cada uno tipado, validado y documentado en tu idioma.
- **Valores por defecto de ruta y anulaciones por ruta**, en los ámbitos desde los que MediaMTX los sirve realmente. Guardar una transmisión cubierta por un comodín materializa una entrada dispersa, así que las claves que no tocaste siguen heredando de los valores por defecto — y «revertir a heredado» lo deshace.
- **Los 15 hooks de ruta `runOn*`**, con un aviso allí donde guardar uno reinicia la ruta.
- **Escrituras dispersas.** Connect envía por PATCH solo las claves que cambiaste; lo que no expone se queda como está.

### Pensado para una caja de la que te olvidas

Un solo proceso sirviendo API, SPA y medios · imágenes multiarquitectura · `GET /health` · logs estructurados · PWA instalable · temas claro y oscuro · 30 idiomas · sin base de datos.

## Variables de entorno

Todo esto se puede editar en caliente desde **Config** — estas variables solo siembran el primer arranque.

| Variable | Por defecto | Para qué sirve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Dónde alcanza Connect la API de MediaMTX desde *dentro* de su contenedor |
| `MEDIAMTX_API_PORT` | `9997` | Puerto de la API de MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Ruta del host montada para las grabaciones (solo compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Dónde se guardan las miniaturas generadas |

El valor por defecto `http://mediamtx` solo resuelve dentro de la red del compose incluido. Para un `docker run` independiente, apúntalo a tu host de MediaMTX — o corrígelo luego desde **Config**, sin reiniciar nada.

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

La reproducción va del navegador a MediaMTX directamente. Connect solo mueve JSON, más las grabaciones y miniaturas que lee del disco.

## Documentación

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Todas las capacidades, rutas y procedimientos publicados |
| [Arquitectura](../../ARCHITECTURE.md) | Cómo encajan las piezas |
| [Contribuir](../../CONTRIBUTING.md) | Entorno de desarrollo, scripts y proceso de PR |
| [Ejemplos](../../examples/) | Cámara de Raspberry Pi, transmisiones falsas para pruebas |

## Contribuir

Las issues y los PR son bienvenidos. `pnpm install && pnpm dev` te deja el stack completo con datos de prueba — mira [CONTRIBUTING.md](../../CONTRIBUTING.md) para lo demás, y ten en cuenta que los títulos de PR son [conventional commits](../../CONTRIBUTING.md). Este proyecto sigue un [Código de Conducta](../../CODE_OF_CONDUCT.md).

## Licencia

[MIT](../../LICENSE)
