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

<h4 align="center">Веб-интерфейс для <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Смотрите трансляции, просматривайте записи и редактируйте конфигурацию в браузере.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Демонстрация MediaMTX Connect" width="720">
</p>

## Как запустить

Образы публикуются как для `linux/amd64`, так и для `linux/arm64` (Raspberry Pi, Apple Silicon и т. д.) — Docker сам загружает нужный.

Уже используете MediaMTX? Поднимите Connect рядом с ним:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /путь/к/записям:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` — это адрес, по которому Connect обращается к API MediaMTX *изнутри* своего контейнера. По умолчанию это `http://mediamtx`, который разрешается только в сети прилагаемого compose — для отдельного `docker run` укажите ваш хост MediaMTX (позже это также можно изменить в **Config**).

Ещё нет MediaMTX? Прилагаемый compose запускает оба:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Откройте http://localhost:3000, перейдите в **Config** и укажите свой MediaMTX.

> Connect требует `api: yes` в `mediamtx.yml`. См. [прилагаемый файл](../../mediamtx.yml) как рабочий пример.

### Конфигурация

Всё настраивается во время работы в разделе **Config**. Эти переменные окружения задают только начальные значения при первом запуске:

| Переменная | По умолчанию | Назначение |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Хост API MediaMTX, доступный из контейнера Connect |
| `MEDIAMTX_API_PORT` | `9997` | Порт API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Путь на хосте, монтируемый для записей (только compose; необязательно — если не задано, берётся значение по умолчанию) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Где хранятся созданные скриншоты |

## Документация

[Архитектура](../../ARCHITECTURE.md) · [Возможности](../../docs/FEATURES.md) · [Участие](../../CONTRIBUTING.md)

> Примечание: документация для разработчиков ведётся только на английском. Интерфейс приложения доступен на русском по адресу `/ru`.

## Кодекс поведения

Этот проект следует [Кодексу поведения](../../CODE_OF_CONDUCT.md). Участвуя, вы соглашаетесь его соблюдать.

## Лицензия

MIT
