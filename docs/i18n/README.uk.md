<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Вебінтерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Дивіться трансляції наживо, гортайте записи й редагуйте конфігурацію MediaMTX просто в браузері.</p>

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

Мультиархітектурні образи (`linux/amd64`, `linux/arm64`); Docker завантажить потрібний.

**MediaMTX уже працює?** Поставте Connect поруч:

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

**Починаєте з нуля?** Вбудований compose збирає Connect і запускає його поруч із MediaMTX:

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

- **WebRTC або HLS — для кожної картки.** `AUTO` тихо перемикається на запасний варіант, `LOW-LAT` наполягає на WebRTC, `COMPAT` примусово вмикає HLS. Кожна картка показує транспорт, який реально отримала.
- **Знімки у спокої.** Фонове завдання тримає на кожній картці свіжий кадр, а його вік — на бейджі. Потрібен новий просто зараз? Зробіть його з меню картки.
- **Жива телеметрія.** Кодеки, кількість глядачів і час в ефірі — просто зі списку path.
- **Чесний стан запису.** Картки показують, чи потік записується *фактично*; стан, який Connect не зміг прочитати, зветься невідомим, а не вимкненим.
- **Адреси публікації в буфер обміну.** RTSP, RTMP і SRT, побудовані з власних адрес прослуховування сервера. Сторінка кожного path іде далі й має панель публікації та читання: усі протоколи, які роздає сервер, зокрема WHIP, WHEP, HLS і варіанти з TLS, з готовими до копіювання прикладами для ffmpeg, GStreamer, OBS, ffplay і VLC.

### Записи

- Денна шкала часу для кожного потоку з сервера відтворення MediaMTX: записані відрізки та проміжки між ними, кожен можна відтворити. Якщо відтворення вимкнено, Connect перелічує точні зміни конфігурації, які для цього потрібні, і застосовує їх одним кліком.
- Завантаження кліпу: будь-який проміжок до години (або останні 5 хв, 15 хв чи година) одним звичайним MP4, який MediaMTX склеює із сегментів без перекодування.
- Сегменти MP4 або MPEG-TS кожного потоку, згруповані за днями, з автоматичними мініатюрами.
- Програвач, що розгортається просто в рядку, з перемоткою через HTTP Range-запити.
- Потокове завантаження з прогресом наживо і скасуванням.
- Натисніть `/`, щоб відфільтрувати.

### Сесії

- **Усі підключені — в одній таблиці.** Видавці й читачі через RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC і HLS, з віддаленою адресою, вхідними й вихідними байтами та часом роботи, з оновленням кожні 5 секунд.
- **Від'єднайте клієнта** після підтвердження. Він може підключитися знову; від'єднання — не бан.

### Конфігурація без YAML

- **Конфігурація сервера:** 66 типізованих і перевірених елементів керування в Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC і SRT.
- **Path defaults і перевизначення для окремих path** — у тих областях, звідки MediaMTX їх віддає. Збереження потоку, покритого шаблоном, пише розріджений запис, тож незмінені ключі й далі слідують за типовими значеннями.
- **Каталог path** із позначками live і regex, покрокова форма «додати RTSP-камеру», а також відкат або видалення власного запису будь-якого path (із попередженням, якщо хтось підключений).
- **Стан наживо на сторінці кожного path:** доріжки, читачі, передані байти, кадри з помилками й час роботи, з оновленням кожні 5 секунд. Path, у який ніхто не публікує, показується простоєм, а не поломкою.
- **Стійкість для кожного path:** завжди доступний запасний варіант, що крутить по колу офлайн-кліп, поки камера недоступна, і підтягування на вимогу, яке відкриває джерело лише тоді, коли хтось дивиться.
- **Кожен хук `runOn*`**, із попередженням там, де збереження перезапускає path.
- **Переспрямування:** передавайте path на YouTube, Twitch або інший сервер через нативний список `forward` у MediaMTX, з прихованими ключами потоку і без перезапуску path.
- **Розріджений запис.** Надсилаються лише змінені ключі.

### Експлуатація

Один процес на API, SPA і медіа · мультиархітектурність · `GET /api/health` · версія MediaMTX у шапці · структуровані логи · встановлюється як PWA · світла й темна · 30 мов · без бази даних.

## Змінні середовища

Вони задають початкові значення для першого запуску. Усе лишається редагованим у **Config**.

| Змінна | Типове значення в образі | Призначення |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Де Connect дістає API MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Де *браузер* дістає MediaMTX для відтворення. Задавайте її щоразу, коли браузер працює не на сервері |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Звідки Connect читає записи |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Куди потрапляють знімки й мініатюри |
| `DATA_DIR` | `/data` | Де лежить `config.json` |
| `PORT` | `3000` | HTTP-порт |
| `LOG_LEVEL` | `info` | Рівень логування Pino |

`http://mediamtx` розв'язується лише в мережі вбудованого compose. Для окремого `docker run` вкажіть свій хост. З compose задайте `REMOTE_MEDIAMTX_HOST` у `.env` замість `REMOTE_MEDIAMTX_URL`: вона також задає хост WebRTC, який оголошує MediaMTX. [`.env.example`](../../.env.example) пояснює кожну з них, а `pnpm dev` використовує типові значення для localhost узагалі без `.env`.

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

Відтворення наживо йде з браузера до MediaMTX. Connect переносить JSON, а також записи й мініатюри: з диска або як записані відрізки, проксовані із сервера відтворення MediaMTX.

## Документація

| | |
|---|---|
| [Можливості](../../docs/FEATURES.md) | Усі випущені можливості, маршрути та процедури |
| [Архітектура](../../docs/ARCHITECTURE.md) | Як складаються частини |
| [Участь](../../CONTRIBUTING.md) | Налаштування середовища, скрипти, процес PR |
| [Приклади](../../examples/) | Камера Raspberry Pi, фейкові потоки для тестів |

## Участь

Issue та PR вітаються. `pnpm install && pnpm dev` підніме повний стек із тестовими даними. Дивіться [CONTRIBUTING.md](../../CONTRIBUTING.md) і зважайте, що заголовки PR — conventional commits. Ми дотримуємося [Кодексу поведінки](../../CODE_OF_CONDUCT.md).

## Ліцензія

[MIT](../../LICENSE)
