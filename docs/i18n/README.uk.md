<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
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

<h4 align="center">Веб-інтерфейс для <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Дивіться трансляції, переглядайте записи та редагуйте конфігурацію в браузері.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Демонстрація MediaMTX Connect" width="720">
</p>

## Як запустити

Образи публікуються і для `linux/amd64`, і для `linux/arm64` (Raspberry Pi, Apple Silicon тощо) — Docker автоматично завантажує потрібний.

Вже використовуєте MediaMTX? Розгорніть Connect поруч із ним:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /shlyakh/do/zapysiv:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` — це адреса, за якою Connect звертається до API MediaMTX *зсередини* свого контейнера. Типове значення — `http://mediamtx`, яке розпізнається лише в мережі долученого compose — для окремого `docker run` вкажіть свій хост MediaMTX (це також можна змінити пізніше в розділі **Config**).

Ще немає MediaMTX? Долучений compose запускає обидва:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Відкрийте http://localhost:3000, перейдіть до **Config** і вкажіть на свій MediaMTX.

> Connect потребує `api: yes` у вашому `mediamtx.yml`. Див. [долучений файл](../../mediamtx.yml) як робочий приклад.

### Конфігурація

Усе налаштовується під час роботи в розділі **Config**. Ці змінні середовища задають лише початкові значення для першого запуску:

| Змінна | Типове значення | Призначення |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Хост API MediaMTX, доступний із контейнера Connect |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Шлях на хості, змонтований для записів (лише compose; необов'язковий — якщо не задано, використовується типове значення) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Де зберігаються згенеровані знімки екрана |

## Документація

[Архітектура](../../ARCHITECTURE.md) · [Можливості](../../docs/FEATURES.md) · [Участь](../../CONTRIBUTING.md)

> Примітка: документація для розробників ведеться лише англійською. Інтерфейс застосунку доступний українською за адресою `/uk`.

## Кодекс поведінки

Цей проєкт дотримується [Кодексу поведінки](../../CODE_OF_CONDUCT.md). Беручи участь, ви погоджуєтесь його дотримуватися.

## Ліцензія

MIT
