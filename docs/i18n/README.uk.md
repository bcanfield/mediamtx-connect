<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Вебінтерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Дивіться трансляції наживо, гортайте записи й редагуйте будь-який ключ конфігурації — просто в браузері.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — сітка трансляцій наживо, браузер записів і редактор конфігурації" width="860">

</div>

## Що це

MediaMTX — чудовий стримінговий сервер, і він постачається без інтерфейсу. Connect — той самий відсутній фронтенд: один контейнер, який спілкується з API MediaMTX і перетворює його на стіну камер, архів записів і редактор конфігурації.

Це супутник, а не заміна. Кожен екран спирається на те, що MediaMTX уже надає — path, ендпоїнт API, хук `runOn*`, протокол, який він роздає нативно. Connect не зберігає відео, не проксує медіа й не тримає бази даних. Наведіть його на працюючий сервер — і все працює.

## Швидкий старт

Образи публікуються для `linux/amd64` та `linux/arm64` (Raspberry Pi, Apple Silicon і подібні), тож Docker завантажить потрібний сам.

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

У будь-якому разі відкрийте <http://localhost:3000>.

> [!IMPORTANT]
> Connect потребує `api: yes` у вашому `mediamtx.yml` — саме через цей API він усе читає й записує. [Долучена конфігурація](../../mediamtx.yml) — робочий зразок.

## Що ви отримуєте

### Перегляд наживо

Сітка з усіх path, які знає MediaMTX, у 2, 3 або 4 колонки.

- **WebRTC або HLS — для кожної картки окремо.** `AUTO` віддає перевагу WebRTC і тихо відкочується на HLS, `LOW-LAT` наполягає на WebRTC, а `COMPAT` примусово вмикає HLS. Кожна картка домовляється про власне з'єднання й показує транспорт, який реально отримала, — а не той, що ви попросили.
- **Знімки навіть у спокої.** Фонове завдання бере кадр із кожного потоку, тож неактивні картки все одно показують сцену, а вік кадру видно на бейджі. «Зробити знімок» бере кадр негайно.
- **Жива телеметрія.** Бейджі кодеків, кількість глядачів і час в ефірі — просто зі списку path, без додаткових запитів.
- **Стан запису, який каже правду.** Картки показують, чи потік записується *фактично* (власне перевизначення поверх path defaults — саме так, як це розв'язує MediaMTX); стан, який не вдалося прочитати, показано як невідомий, а не як вимкнений.
- **Адреси публікації в буфер обміну.** Цілі RTSP, RTMP і SRT будуються з власних адрес прослуховування сервера, тож змінений порт лишається правильним портом.

### Записи

- MP4 кожного потоку, згруповані за днями, найновіші зверху, з автоматично створеними мініатюрами.
- Програвач, що розгортається просто в рядку, зі справжньою смугою перемотки на HTTP Range-запитах.
- Потокове завантаження з прогресом у реальному часі, швидкістю та кнопкою скасування.
- Натисніть `/` будь-де, щоб відфільтрувати.

### Конфігурація без YAML

- **Уся конфігурація сервера** — 65 елементів керування в розділах Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC і SRT, кожен типізований, перевірений і описаний вашою мовою.
- **Path defaults і перевизначення для окремих path** — у тих областях, звідки MediaMTX їх справді віддає. Збереження потоку, покритого шаблоном, створює розріджений запис, тож незмінені ключі й далі йдуть за типовими значеннями — а «повернути успадковане» це скасовує.
- **Усі 15 path-хуків `runOn*`**, із попередженням там, де збереження перезапускає path.
- **Розріджений запис.** Connect надсилає PATCH лише зі зміненими ключами; те, чого він не показує, лишається недоторканим.

### Зроблено для коробки, про яку забуваєш

Один процес віддає API, SPA і медіа · мультиархітектурні образи · `GET /health` · структуровані логи · встановлювана PWA · світла й темна теми · 30 мов · без бази даних.

## Змінні середовища

Усе це редагується на льоту в розділі **Config** — змінні лише задають значення на перший запуск.

| Змінна | Типове значення | Призначення |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Де Connect дістає API MediaMTX *зсередини* свого контейнера |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Шлях на хості, змонтований під записи (лише compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Де зберігаються створені мініатюри |

Типове `http://mediamtx` розв'язується лише в мережі вбудованого compose. Для окремого `docker run` вкажіть свій хост MediaMTX — або виправте пізніше в **Config**, без перезапуску.

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

Відтворення йде напряму з браузера до MediaMTX. Connect переносить лише JSON плюс записи й мініатюри, які читає з диска.

## Документація

| | |
|---|---|
| [Можливості](../FEATURES.md) | Усі випущені можливості, маршрути та процедури |
| [Архітектура](../../ARCHITECTURE.md) | Як складаються частини |
| [Участь](../../CONTRIBUTING.md) | Налаштування середовища, скрипти, процес PR |
| [Приклади](../../examples/) | Камера Raspberry Pi, фейкові потоки для тестів |

## Участь

Issue та PR вітаються. `pnpm install && pnpm dev` підніме повний стек із тестовими даними — решта в [CONTRIBUTING.md](../../CONTRIBUTING.md); зверніть увагу, що заголовки PR — це [conventional commits](../../CONTRIBUTING.md). Проєкт дотримується [Кодексу поведінки](../../CODE_OF_CONDUCT.md).

## Ліцензія

[MIT](../../LICENSE)
