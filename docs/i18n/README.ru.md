<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Веб-интерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Смотрите трансляции, просматривайте записи и правьте любой ключ конфигурации — прямо в браузере.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — сетка трансляций, браузер записей и редактор конфигурации" width="860">

</div>

## Что это

MediaMTX — отличный стриминговый сервер, и он поставляется без интерфейса. Connect — недостающий фронтенд: один контейнер, который говорит с API MediaMTX и превращает его в стену камер, архив записей и редактор конфигурации.

Это спутник, а не замена. Каждый экран опирается на то, что MediaMTX уже отдаёт, — path, эндпоинт API, хук `runOn*`, протокол, который он раздаёт нативно. Connect не хранит видео, не проксирует медиа и обходится без базы данных. Направьте его на работающий сервер — и всё работает.

## Быстрый старт

Образы публикуются для `linux/amd64` и `linux/arm64` (Raspberry Pi, Apple Silicon и подобные), так что Docker сам скачает нужный.

**MediaMTX уже работает?** Поставьте Connect рядом:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Начинаете с нуля?** Встроенный compose поднимет оба сервиса:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

В обоих случаях откройте <http://localhost:3000>.

> [!IMPORTANT]
> Connect требует `api: yes` в вашем `mediamtx.yml` — через этот API он всё читает и пишет. [Приложенная конфигурация](../../mediamtx.yml) — рабочий пример.

## Что вы получаете

### Живой просмотр

Сетка всех path, о которых знает MediaMTX, в 2, 3 или 4 колонки.

- **WebRTC или HLS — для каждой карточки.** `AUTO` предпочитает WebRTC и молча откатывается на HLS, `LOW-LAT` настаивает на WebRTC, `COMPAT` принудительно включает HLS. Каждая карточка договаривается о своём соединении и показывает транспорт, который реально получила, — а не тот, который вы запросили.
- **Снимки в простое.** Фоновая задача берёт кадр с каждого потока, поэтому неактивные карточки всё равно показывают картину — с возрастом кадра на плашке. «Сделать снимок» снимает кадр немедленно.
- **Живая телеметрия.** Чипы кодеков, число зрителей и время в эфире — прямо из списка path, без дополнительных запросов.
- **Состояние записи, которое говорит правду.** Карточки показывают, идёт ли запись *фактически* (собственное переопределение потока поверх path defaults — ровно так, как это разрешает MediaMTX); состояние, которое не удалось прочитать, отображается как неизвестное, а не как выключенное.
- **Ссылки для публикации в буфер обмена.** Адреса RTSP, RTMP и SRT строятся из собственных listen-адресов сервера, поэтому изменённый порт остаётся правильным портом.

### Записи

- MP4 каждого потока, сгруппированные по дням, свежие сверху, с автоматически созданными миниатюрами.
- Плеер, разворачивающийся прямо в строке, с настоящей полосой перемотки на HTTP Range-запросах.
- Потоковая загрузка с прогрессом в реальном времени, скоростью и кнопкой отмены.
- Нажмите `/` в любом месте, чтобы отфильтровать.

### Конфигурация без YAML

- **Вся серверная конфигурация** — 65 элементов управления в разделах Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC и SRT, каждый типизирован, валидируется и описан на вашем языке.
- **Path defaults и переопределения для отдельных path** — в тех областях, откуда MediaMTX их действительно отдаёт. Сохранение потока, покрытого шаблоном, создаёт разреженную запись, поэтому нетронутые ключи продолжают следовать за умолчаниями, а «вернуть наследование» отменяет это.
- **Все 15 path-хуков `runOn*`**, с предупреждением там, где сохранение перезапускает path.
- **Разреженная запись.** Connect отправляет PATCH только с изменёнными ключами; всё, что он не показывает, остаётся нетронутым.

### Сделано для коробки, про которую забываешь

Один процесс отдаёт API, SPA и медиа · мультиархитектурные образы · `GET /health` · структурированные логи · устанавливаемая PWA · тёмная и светлая темы · 30 языков · без базы данных.

## Переменные окружения

Всё это редактируется на лету в разделе **Config** — переменные задают лишь значения при первом запуске.

| Переменная | По умолчанию | Назначение |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Где Connect достаёт API MediaMTX *изнутри* своего контейнера |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Путь на хосте, смонтированный под записи (только compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Где хранятся созданные миниатюры |

Значение по умолчанию `http://mediamtx` разрешается только в сети встроенного compose. Для отдельного `docker run` укажите свой хост MediaMTX — или поправьте позже в **Config**, перезапуск не нужен.

## Как это устроено

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

Воспроизведение идёт напрямую из браузера в MediaMTX. Connect передаёт только JSON плюс записи и миниатюры, которые читает с диска.

## Документация

| | |
|---|---|
| [Возможности](../FEATURES.md) | Все выпущенные возможности, маршруты и процедуры |
| [Архитектура](../../ARCHITECTURE.md) | Как части складываются вместе |
| [Участие](../../CONTRIBUTING.md) | Настройка окружения, скрипты, процесс PR |
| [Примеры](../../examples/) | Камера Raspberry Pi, фейковые потоки для тестов |

## Участие

Issue и PR приветствуются. `pnpm install && pnpm dev` поднимает полный стек с тестовыми данными — остальное в [CONTRIBUTING.md](../../CONTRIBUTING.md); учтите, что заголовки PR — это [conventional commits](../../CONTRIBUTING.md). Проект следует [Кодексу поведения](../../CODE_OF_CONDUCT.md).

## Лицензия

[MIT](../../LICENSE)
