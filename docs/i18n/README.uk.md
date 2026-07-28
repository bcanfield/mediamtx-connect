<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Вебінтерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Дивіться трансляції наживо, гортайте записи, редагуйте будь-який ключ конфігурації — просто в браузері.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — сітка трансляцій наживо, браузер записів і редактор конфігурації" width="860">

<details>
<summary>🌍 Читати 30 мовами</summary>
<p>
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
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
  🇺🇦 <strong>Українська</strong> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## Що це

MediaMTX — чудовий стримінговий сервер без інтерфейсу. Connect — той самий відсутній фронтенд: один контейнер, який спілкується з API MediaMTX і перетворює його на стіну камер, архів записів і редактор конфігурації.

Це супутник, а не заміна. Кожен екран спирається на те, що MediaMTX уже надає: path, ендпоїнт API, хук `runOn*`, протокол, який він роздає нативно. Не зберігає відео, не проксує медіа, не тримає бази даних.

## Швидкий старт

Мультиархітектурні образи (`linux/amd64`, `linux/arm64`) — Docker завантажить потрібний.

**MediaMTX уже працює?** Поставте Connect поруч:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Починаєте з нуля?** Вбудований compose підніме обидва:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Далі відкрийте <http://localhost:3000>.

> [!IMPORTANT]
> Connect потребує `api: yes` у вашому `mediamtx.yml`. [Долучена конфігурація](../../mediamtx.yml) працює як є.

## Що ви отримуєте

### Перегляд наживо

Усі path, які знає MediaMTX, сіткою в 2–4 колонки.

- **WebRTC або HLS — для кожної картки.** `AUTO` тихо відкочується на HLS, `LOW-LAT` наполягає на WebRTC, `COMPAT` вмикає HLS — і кожна картка показує транспорт, який реально отримала.
- **Знімки у спокої.** Фонове завдання тримає на кожній картці свіжий кадр, а його вік — на бейджі.
- **Жива телеметрія.** Кодеки, кількість глядачів і час в ефірі — просто зі списку path.
- **Чесний стан запису.** Картки показують, чи потік записується *фактично*; стан, який Connect не зміг прочитати, зветься невідомим, а не вимкненим.
- **Адреси публікації в буфер обміну.** RTSP, RTMP і SRT, побудовані з власних адрес прослуховування сервера.

### Записи

- MP4 кожного потоку, згруповані за днями, з автоматичними мініатюрами.
- Програвач, що розгортається просто в рядку, з перемоткою через HTTP Range-запити.
- Потокове завантаження з прогресом і скасуванням.
- Натисніть `/`, щоб відфільтрувати.

### Конфігурація без YAML

- **Уся конфігурація сервера** — 65 типізованих і перевірених елементів керування в Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC і SRT.
- **Path defaults і перевизначення для окремих path** — у тих областях, звідки MediaMTX їх віддає. Збереження потоку, покритого шаблоном, пише розріджений запис, тож незмінені ключі й далі успадковуються.
- **Усі 15 хуків `runOn*`**, із попередженням там, де збереження перезапускає path.
- **Розріджений запис** — лише змінені ключі.

### Експлуатація

Один процес на API, SPA і медіа · мультиархітектурність · `GET /health` · структуровані логи · PWA · світла й темна · 30 мов · без бази даних.

## Змінні середовища

Вони задають лише перший запуск. Далі все правиться в **Config**.

| Змінна | Типове значення | Призначення |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Де Connect дістає API MediaMTX зсередини свого контейнера |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Шлях на хості, змонтований під записи (лише compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Де зберігаються мініатюри |

`http://mediamtx` розв'язується лише в мережі вбудованого compose — для окремого `docker run` вкажіть свій хост.

## Як це працює

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

Відтворення йде з браузера до MediaMTX. Connect переносить лише JSON плюс записи й мініатюри, які читає з диска.

## Документація

| | |
|---|---|
| [Можливості](../FEATURES.md) | Усі випущені можливості, маршрути та процедури |
| [Архітектура](../../ARCHITECTURE.md) | Як складаються частини |
| [Участь](../../CONTRIBUTING.md) | Налаштування середовища, скрипти, процес PR |
| [Приклади](../../examples/) | Камера Raspberry Pi, фейкові потоки для тестів |

## Участь

Issue та PR вітаються. `pnpm install && pnpm dev` підніме повний стек із тестовими даними — решта в [CONTRIBUTING.md](../../CONTRIBUTING.md); заголовки PR — conventional commits. Ми дотримуємося [Кодексу поведінки](../../CODE_OF_CONDUCT.md).

## Ліцензія

[MIT](../../LICENSE)
