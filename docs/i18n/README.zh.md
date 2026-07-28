<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <strong>中文</strong> •
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

<h4 align="center">用于 <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a> 的网页界面。在浏览器中观看直播、浏览录像并编辑配置。</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect 演示" width="720">
</p>

## 运行方法

镜像同时发布了 `linux/amd64` 和 `linux/arm64` 版本（Raspberry Pi、Apple Silicon 等）——Docker 会自动拉取合适的那个。

已经在运行 MediaMTX 了？把 Connect 部署在它旁边即可：

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` 是 Connect 从其容器*内部*访问 MediaMTX API 的地址。默认值为 `http://mediamtx`，它只能在随附的 compose 网络中解析——如果是独立的 `docker run`，请把它设置为你的 MediaMTX 主机（之后也可以在 **Config** 中修改）。

还没有 MediaMTX？随附的 compose 会同时启动两者：

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

打开 http://localhost:3000，进入 **Config**，将其指向你的 MediaMTX。

> Connect 需要在 `mediamtx.yml` 中设置 `api: yes`。可参考[随附文件](../../mediamtx.yml)作为可用示例。

### 配置

所有配置都可以在运行时于 **Config** 中修改。这些环境变量仅用于首次启动时的初始化：

| 变量 | 默认值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | MediaMTX API 主机，需可从 Connect 的容器访问 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 端口 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 为录像挂载的宿主机路径（仅限 compose；可选——未设置时使用默认值） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 生成的截图的存放位置 |

## 文档

[架构](../../ARCHITECTURE.md) · [功能](../../docs/FEATURES.md) · [贡献指南](../../CONTRIBUTING.md)

> 注意：开发者文档仅以英文维护。应用界面在 `/zh` 下提供中文版本。

## 行为准则

本项目遵循[行为准则](../../CODE_OF_CONDUCT.md)。参与本项目即表示你同意遵守它。

## 许可

MIT
