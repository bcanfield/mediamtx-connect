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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect —— 直播墙、录像浏览器与配置编辑器" width="860">

</div>

## 这是什么

MediaMTX 是一款出色的流媒体服务器，但它不带界面。Connect 就是它缺的那个前端：一个容器，对接 MediaMTX API，把它变成一面监控墙、一个录像库和一个配置编辑器。

它是伴侣，不是替代品。每个页面都对应 MediaMTX 本就暴露的东西 —— 一条 path、一个 API 端点、一个 `runOn*` 钩子、一种它原生提供的协议。Connect 不存视频、不代理媒体、不用数据库。指向一台正在运行的服务器即可使用。

## 快速开始

镜像同时发布 `linux/amd64` 与 `linux/arm64`（树莓派、Apple Silicon 等），Docker 会自动拉取正确的那个。

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

无论哪种方式，打开 <http://localhost:3000>。

> [!IMPORTANT]
> Connect 需要你的 `mediamtx.yml` 里有 `api: yes` —— 它的一切读写都走这个 API。[附带的配置](../../mediamtx.yml)是一份可用的参考。

## 你能得到什么

### 实时画面

MediaMTX 已知的每条 path 都在网格里，可切换 2、3、4 列。

- **逐卡片选择 WebRTC 或 HLS。** `AUTO` 优先 WebRTC 并静默回退到 HLS，`LOW-LAT` 坚持走 WebRTC，`COMPAT` 强制 HLS。每张卡片各自协商连接，并显示实际用上的传输方式 —— 而不是你请求的那种。
- **空闲时也有快照。** 后台任务会为每条流抓取画面，因此未播放的卡片依然能看到现场，标签上还带着这一帧的时间。「立即截图」可随时抓一张。
- **实时遥测。** 编解码标签、观看人数和在线时长，全部取自 path 列表 —— 不产生额外请求。
- **如实反映的录制状态。** 卡片显示的是流*实际*是否在录制（它自己的覆盖项叠加在 path 默认值之上，与 MediaMTX 的解析方式一致）；读不到的状态显示为未知，而不是显示为关闭。
- **推流地址一键复制。** RTSP、RTMP 与 SRT 地址由服务器自己的监听地址生成，所以改过的端口依然是对的端口。

### 录像

- 每条流的 MP4，按天分组、最新在前，并自动生成缩略图。
- 就地展开的内嵌播放器，配一条真正可拖动的进度条，底层是 HTTP Range 请求。
- 边下边显示进度、速度，并可随时取消的流式下载。
- 在任意位置按 `/` 即可过滤。

### 配置，无需写 YAML

- **完整的服务器配置** —— Logging、API、Hooks、RTSP、RTMP、HLS、WebRTC、SRT 共 65 个控件，每一个都有类型、有校验，并以你的语言给出说明。
- **path 默认值与逐 path 覆盖**，都落在 MediaMTX 真正提供它们的作用域上。保存一条由通配符覆盖的流会生成一条稀疏条目，未改动的键继续跟随默认值 —— 「恢复为继承」可以撤销。
- **全部 15 个 `runOn*` path 钩子**，凡是保存后会重启 path 的地方都有提示。
- **稀疏写入。** Connect 只 PATCH 你改过的键；没有暴露的部分原样保留。

### 为一台你可以忘掉的机器而设计

单进程同时提供 API、SPA 与媒体 · 多架构镜像 · `GET /health` · 结构化日志 · 可安装 PWA · 明暗主题 · 30 种语言 · 无数据库。

## 环境变量

这些都能在 **Config** 里随时修改 —— 环境变量只用于首次启动的初始值。

| 变量 | 默认值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 在其容器*内部*访问 MediaMTX API 的地址 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 端口 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 挂载录像的宿主机路径（仅 compose） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 生成的缩略图存放位置 |

默认值 `http://mediamtx` 只在自带 compose 的网络里能解析。独立使用 `docker run` 时，请把它设成你的 MediaMTX 主机 —— 或之后在 **Config** 里改，无需重启。

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

欢迎提 issue 和 PR。`pnpm install && pnpm dev` 会带起完整栈并预置示例数据 —— 其余内容见 [CONTRIBUTING.md](../../CONTRIBUTING.md)，另外 PR 标题需遵循 [conventional commits](../../CONTRIBUTING.md)。本项目遵守[行为准则](../../CODE_OF_CONDUCT.md)。

## 许可证

[MIT](../../LICENSE)
