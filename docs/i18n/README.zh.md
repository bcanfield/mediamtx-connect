<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> 的 Web 界面。</strong><br>
在浏览器里观看直播、浏览录像、修改任意配置项。</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect —— 直播墙、录像浏览器与配置编辑器" width="860">

<details>
<summary>🌍 用 30 种语言阅读</summary>
<p>
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
</details>

</div>

## 这是什么

MediaMTX 是出色的流媒体服务器，但没有界面。Connect 就是它缺的那个前端：一个容器，对接 MediaMTX API，把它变成监控墙、录像库和配置编辑器。

它是伴侣，不是替代品。每个页面都对应 MediaMTX 本就暴露的东西：一条 path、一个 API 端点、一个 `runOn*` 钩子、一种它原生提供的协议。不存视频，不代理媒体，不用数据库。

## 快速开始

多架构镜像（`linux/amd64`、`linux/arm64`）—— Docker 会拉取正确的那个。

**已经在跑 MediaMTX？** 把 Connect 放在它旁边：

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**从零开始？** 自带的 compose 会同时启动两者：

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

然后打开 <http://localhost:3000>。

> [!IMPORTANT]
> Connect 需要你的 `mediamtx.yml` 里有 `api: yes`。[附带的配置](../../mediamtx.yml)开箱可用。

## 你能得到什么

### 实时画面

MediaMTX 已知的每条 path，2 到 4 列网格排布。

- **逐卡片选择 WebRTC 或 HLS。** `AUTO` 静默回退到 HLS，`LOW-LAT` 坚持走 WebRTC，`COMPAT` 强制 HLS —— 每张卡片显示的都是实际用上的传输方式。
- **空闲时也有快照。** 后台任务为每张卡片保留一帧近照，并在标签上标出它的时间。
- **实时遥测。** 编解码、观看人数和在线时长，直接取自 path 列表。
- **如实的录制状态。** 卡片显示流是否*实际*在录制；读不到的状态显示为未知，绝不显示为关闭。
- **推流地址一键复制。** RTSP、RTMP 与 SRT，由服务器自己的监听地址生成。

### 录像

- 每条流的 MP4，按天分组，并自动生成缩略图。
- 就地展开的内嵌播放器，基于 HTTP Range 请求可自由拖动。
- 流式下载，带实时进度与取消。
- 按 `/` 即可过滤。

### 配置，无需写 YAML

- **完整的服务器配置** —— Logging、API、Hooks、RTSP、RTMP、HLS、WebRTC、SRT 共 65 个带类型、带校验的控件。
- **path 默认值与逐 path 覆盖**，落在 MediaMTX 真正提供它们的作用域上。保存通配符覆盖的流会写入一条稀疏条目，未改动的键继续跟随默认值。
- **全部 15 个 `runOn*` 钩子**，凡是保存后会重启 path 的地方都有提示。
- **稀疏写入** —— 只提交你改过的键。

### 运维

单进程提供 API、SPA 与媒体 · 多架构 · `GET /health` · 结构化日志 · PWA · 明暗主题 · 30 种语言 · 无数据库。

## 环境变量

它们只用于首次启动。之后一切都能在 **Config** 里改。

| 变量 | 默认值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 在其容器内部访问 MediaMTX API 的地址 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 端口 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 挂载录像的宿主机路径（仅 compose） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 缩略图存放位置 |

`http://mediamtx` 只在自带 compose 的网络里能解析 —— 独立使用 `docker run` 时，请指向你自己的主机。

## 工作原理

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

播放是浏览器直连 MediaMTX。Connect 只搬运 JSON，外加它从磁盘读出的录像和缩略图。

## 文档

| | |
|---|---|
| [功能清单](../FEATURES.md) | 已交付的全部能力、路由与过程 |
| [架构](../../ARCHITECTURE.md) | 各部分如何组合 |
| [参与贡献](../../CONTRIBUTING.md) | 开发环境、脚本与 PR 流程 |
| [示例](../../examples/) | 树莓派摄像头、用于测试的模拟流 |

## 参与贡献

欢迎提 issue 和 PR。`pnpm install && pnpm dev` 会带起完整栈并预置示例数据 —— 详见 [CONTRIBUTING.md](../../CONTRIBUTING.md)，另外 PR 标题需遵循 conventional commits。我们遵守[行为准则](../../CODE_OF_CONDUCT.md)。

## 许可证

[MIT](../../LICENSE)
