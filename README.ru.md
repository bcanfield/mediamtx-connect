<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <a href="./README.md">English</a> · <a href="./README.es.md">Español</a> · <a href="./README.zh.md">中文</a> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <strong>Русский</strong> · <a href="./README.fr.md">Français</a> · <a href="./README.pt.md">Português</a></p>
  <p>Веб-интерфейс для <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Смотрите трансляции, просматривайте записи и редактируйте конфигурацию в браузере.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Демонстрация MediaMTX Connect" width="720">
</div>

## Как запустить

Уже используете MediaMTX? Поднимите Connect рядом с ним:

```bash
docker run -d \
  -p 3000:3000 \
  -v /путь/к/записям:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Ещё нет MediaMTX? Прилагаемый compose запускает оба:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Откройте http://localhost:3000, перейдите в **Config** и укажите свой MediaMTX.

> Connect требует `api: yes` в `mediamtx.yml`. См. [прилагаемый файл](mediamtx.yml) как рабочий пример.

## Документация

[Архитектура](ARCHITECTURE.md) · [Возможности](docs/FEATURES.md) · [Участие](CONTRIBUTING.md)

> Примечание: документация для разработчиков ведётся только на английском. Интерфейс приложения доступен на русском по адресу `/ru`.

## Лицензия

MIT
