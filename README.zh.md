<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <a href="./README.md">English</a> · <a href="./README.es.md">Español</a> · <strong>中文</strong> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt.md">Português</a></p>
  <p>用于 <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> 的网页界面。在浏览器中观看直播、浏览录像并编辑配置。</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="MediaMTX Connect 演示" width="720">
</div>

## 运行方法

已经在运行 MediaMTX 了？把 Connect 部署在它旁边即可：

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

还没有 MediaMTX？随附的 compose 会同时启动两者：

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

打开 http://localhost:3000，进入 **Config**，将其指向你的 MediaMTX。

> Connect 需要在 `mediamtx.yml` 中设置 `api: yes`。可参考[随附文件](mediamtx.yml)作为可用示例。

## 文档

[架构](ARCHITECTURE.md) · [功能](docs/FEATURES.md) · [贡献指南](CONTRIBUTING.md)

> 注意：开发者文档仅以英文维护。应用界面在 `/zh` 下提供中文版本。

## 许可

MIT
