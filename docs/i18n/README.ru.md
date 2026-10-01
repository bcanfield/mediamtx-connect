<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Веб-интерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Смотрите трансляции, просматривайте записи и правьте конфигурацию MediaMTX прямо в браузере.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — сетка трансляций, браузер записей и редактор конфигурации" width="860">

<details>
<summary>🌍 Читать на 30 языках</summary>
<p>
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <strong>Русский</strong> •
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

## Что это

MediaMTX — отличный стриминговый сервер без интерфейса. Connect — недостающий фронтенд: один контейнер, который говорит с API MediaMTX и превращает его в стену камер, архив записей и редактор конфигурации.

Это спутник, а не замена. Каждый экран опирается на то, что MediaMTX уже отдаёт: path, эндпоинт API, хук `runOn*`, протокол, который он раздаёт нативно. Видео не хранит, медиа не проксирует, базы данных нет.

## Быстрый старт

Мультиархитектурные образы (`linux/amd64`, `linux/arm64`); Docker скачает нужный.

**MediaMTX уже работает?** Поставьте Connect рядом:

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

**Начинаете с нуля?** Встроенный compose соберёт Connect и запустит его рядом с MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Затем откройте <http://localhost:3000>.

> [!IMPORTANT]
> Connect требует `api: yes` в вашем `mediamtx.yml`. [Приложенная конфигурация](../../mediamtx.yml) работает как есть.

## Что вы получаете

### Живой просмотр

Все path, которые знает MediaMTX, сеткой в 2–4 колонки.

- **WebRTC или HLS — для каждой карточки.** `AUTO` молча переключается на запасной вариант, `LOW-LAT` настаивает на WebRTC, `COMPAT` включает HLS. Каждая карточка показывает транспорт, который реально получила.
- **Снимки в простое.** Фоновая задача держит на каждой карточке свежий кадр, а его возраст — на бейдже. Нужен новый прямо сейчас? Сделайте его из меню карточки.
- **Живая телеметрия.** Кодеки, число зрителей и время в эфире — прямо из списка path.
- **Честное состояние записи.** Карточки показывают, идёт ли запись *фактически*; состояние, которое Connect не смог прочитать, отмечено как неизвестное, а не как выключенное.
- **Ссылки для публикации в буфер обмена.** RTSP, RTMP и SRT, построенные из собственных listen-адресов сервера. Страница каждого path идёт дальше — с панелью публикации и чтения: все протоколы, которые раздаёт сервер, включая WHIP, WHEP, HLS и варианты с TLS, с готовыми к копированию сниппетами для ffmpeg, GStreamer, OBS, ffplay и VLC.

### Записи

- Дневная шкала времени для каждого потока от сервера воспроизведения MediaMTX: записанные отрезки и промежутки между ними, каждый можно воспроизвести. Если воспроизведение выключено, Connect перечислит точные изменения конфигурации, которые для этого нужны, и применит их в один клик.
- Скачивание клипов: любой интервал длиной до часа (или последние 5 мин, 15 мин или час) одним обычным MP4, который MediaMTX склеивает из сегментов без перекодирования.
- Сегменты MP4 или MPEG-TS каждого потока, сгруппированные по дням, с автоматическими миниатюрами.
- Встроенный плеер, разворачивающийся прямо на месте, с перемоткой на HTTP Range-запросах.
- Потоковая загрузка с прогрессом и отменой.
- Нажмите `/`, чтобы отфильтровать.

### Сессии

- **Все подключённые — в одной таблице.** Издатели и читатели по RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC и HLS, с удалённым адресом, входящими и исходящими байтами и временем подключения; обновляется каждые 5 секунд.
- **Отключите клиента** после подтверждения. Он может переподключиться; отключение — не бан.

### Конфигурация без YAML

- **Конфигурация сервера:** 66 типизированных и проверяемых элементов в Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC и SRT.
- **Path defaults и переопределения для отдельных path** — в тех областях, откуда MediaMTX их отдаёт. Сохранение потока, покрытого шаблоном, пишет разреженную запись, поэтому нетронутые ключи продолжают следовать значениям по умолчанию.
- **Каталог path** со значками «в эфире» и regex, пошаговой формой «добавить RTSP-камеру», а также откатом или удалением собственной записи любого path (с предупреждением, если кто-то подключён).
- **Живое состояние на странице каждого path:** дорожки, читатели, переданные байты, кадры с ошибками и время работы; обновляется каждые 5 секунд. Path, в который никто не публикует, отображается как простаивающий, а не сломанный.
- **Отказоустойчивость для каждого path:** всегда доступный запасной источник, который крутит офлайн-ролик по кругу, пока камера недоступна, и подтягивание по запросу, которое открывает источник только пока кто-то смотрит.
- **Каждый хук `runOn*`**, с предупреждением там, где сохранение перезапускает path.
- **Пересылка:** отправляйте path на YouTube, Twitch или другой сервер через нативный список `forward` в MediaMTX, с замаскированными ключами трансляции и без перезапуска path.
- **Разреженная запись.** Отправляются только изменённые ключи.

### Эксплуатация

Один процесс на API, SPA и медиа · мультиархитектурность · `GET /api/health` · версия MediaMTX в шапке · структурированные логи · устанавливается как PWA · светлая и тёмная темы · 30 языков · без базы данных.

## Переменные окружения

Они задают лишь первый запуск. Дальше всё правится в **Config**.

| Переменная | По умолчанию в образе | Назначение |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Где Connect достаёт API MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Где *браузер* достаёт MediaMTX для воспроизведения. Задавайте её всякий раз, когда браузер не на сервере |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Откуда Connect читает записи |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Где хранятся снимки и миниатюры |
| `DATA_DIR` | `/data` | Где лежит `config.json` |
| `PORT` | `3000` | HTTP-порт |
| `LOG_LEVEL` | `info` | Уровень логирования Pino |

`http://mediamtx` разрешается только в сети встроенного compose. Для отдельного `docker run` укажите свой хост. С compose задайте `REMOTE_MEDIAMTX_HOST` в `.env` вместо `REMOTE_MEDIAMTX_URL`: она также задаёт WebRTC-хост, который анонсирует MediaMTX. [`.env.example`](../../.env.example) объясняет каждую переменную, а `pnpm dev` использует значения по умолчанию для localhost вовсе без `.env`.

## Как это работает

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

Живое воспроизведение идёт из браузера в MediaMTX. Connect передаёт JSON плюс записи и миниатюры: с диска или как записанные отрезки, проксируемые с сервера воспроизведения MediaMTX.

## Документация

| | |
|---|---|
| [Возможности](../../docs/FEATURES.md) | Все выпущенные возможности, маршруты и процедуры |
| [Архитектура](../../docs/ARCHITECTURE.md) | Как складываются части |
| [Участие](../../CONTRIBUTING.md) | Настройка окружения, скрипты, процесс PR |
| [Примеры](../../examples/) | Камера Raspberry Pi, фейковые потоки для тестов |

## Участие

Issue и PR приветствуются. `pnpm install && pnpm dev` поднимает полный стек с тестовыми данными. См. [CONTRIBUTING.md](../../CONTRIBUTING.md); заголовки PR — conventional commits. Мы следуем [Кодексу поведения](../../CODE_OF_CONDUCT.md).

## Лицензия

[MIT](../../LICENSE)
