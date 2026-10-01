<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> 的 Web 界面。</strong><br>
在浏览器里观看直播、浏览录像、编辑 MediaMTX 配置。</p>

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

多架构镜像（`linux/amd64`、`linux/arm64`），Docker 会拉取正确的那个。

**已经在跑 MediaMTX？** 把 Connect 放在它旁边：

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

**从零开始？** 自带的 compose 会构建 Connect，并在 MediaMTX 旁边运行它：

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

- **逐卡片选择 WebRTC 或 HLS。** `AUTO` 静默回退，`LOW-LAT` 坚持走 WebRTC，`COMPAT` 强制 HLS。每张卡片显示的都是实际用上的传输方式。
- **空闲时也有快照。** 后台任务为每张卡片保留一帧近照，并在标签上标出它的时间。现在就要一张新的？从卡片菜单里截取即可。
- **实时遥测。** 编解码、观看人数和在线时长，直接取自 path 列表。
- **如实的录制状态。** 卡片显示流是否*实际*在录制；Connect 读不到的状态显示为未知，绝不显示为关闭。
- **推流地址一键复制。** RTSP、RTMP 与 SRT，由服务器自己的监听地址生成。每条 path 的页面还提供更完整的推流与拉流面板：涵盖服务器提供的所有协议，包括 WHIP、WHEP、HLS 及各 TLS 变体，并附带可直接复制的 ffmpeg、GStreamer、OBS、ffplay 和 VLC 示例。

### 录像

- 基于 MediaMTX 回放服务器的每条流按天时间轴：显示已录制的时段及其间的空档，每段都能播放。如果回放未开启，Connect 会列出所需的确切配置改动，并一键应用。
- 片段下载：任意不超过一小时的区间（或最近 5 分钟、15 分钟、一小时），由 MediaMTX 跨录像分段拼接为一个普通 MP4，无需重新编码。
- 每条流的 MP4 或 MPEG-TS 录像分段，按天分组，并自动生成缩略图。
- 就地展开的内嵌播放器，基于 HTTP Range 请求可自由拖动。
- 流式下载，带实时进度与取消。
- 按 `/` 即可过滤。

### 会话

- **所有连接，一表尽览。** 通过 RTSP、RTSPS、RTMP、RTMPS、SRT、WebRTC 和 HLS 连接的推流端与拉流端，附远端地址、收发字节数与在线时长，每 5 秒刷新一次。
- **踢出客户端**，需先确认。对方可以重新连接；踢出不等于封禁。

### 配置，无需写 YAML

- **服务器配置：** Logging、API、Authentication、Hooks、RTSP、RTMP、HLS、WebRTC、SRT 共 66 个带类型、带校验的控件。
- **path 默认值与逐 path 覆盖**，落在 MediaMTX 真正提供它们的作用域上。保存通配符覆盖的流会写入一条稀疏条目，未改动的键继续跟随默认值。
- **path 目录**，带实时与正则徽标、引导式"添加 RTSP 摄像头"表单，并可还原或删除任一 path 自己的条目（若有人连接会给出警告）。
- **每条 path 页面上的实时健康状况：** 轨道、拉流端、传输字节数、出错帧数与在线时长，每 5 秒刷新一次。没有推流的 path 显示为空闲，而非故障。
- **每条 path 的容灾能力：** 始终可用的备用源，在摄像头离线时循环播放离线片段；以及按需拉流，只在有人观看时才打开源。
- **每一个 `runOn*` 钩子**，凡是保存后会重启 path 的地方都有提示。
- **转推：** 通过 MediaMTX 原生的 `forward` 列表，把 path 推送到 YouTube、Twitch 或其他服务器，推流密钥会被遮蔽，且无需重启 path。
- **稀疏写入。** 只提交你改过的键。

### 运维

单进程提供 API、SPA 与媒体 · 多架构 · `GET /api/health` · 页头显示 MediaMTX 版本 · 结构化日志 · 可安装为 PWA · 明暗主题 · 30 种语言 · 无数据库。

## 环境变量

它们只用于首次启动。之后一切都能在 **Config** 里改。

| 变量 | 镜像中的默认值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 访问 MediaMTX API 的地址 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 端口 |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | *浏览器*访问 MediaMTX 进行播放的地址。只要浏览器不在服务器本机上，就应设置它 |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Connect 读取录像的位置 |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 快照与缩略图的存放位置 |
| `DATA_DIR` | `/data` | `config.json` 所在位置 |
| `PORT` | `3000` | HTTP 端口 |
| `LOG_LEVEL` | `info` | Pino 日志级别 |

`http://mediamtx` 只在自带 compose 的网络里能解析。独立使用 `docker run` 时，请指向你自己的主机。使用 compose 时，请在 `.env` 中设置 `REMOTE_MEDIAMTX_HOST`，而不是 `REMOTE_MEDIAMTX_URL`：它还会设置 MediaMTX 对外通告的 WebRTC 主机。[`.env.example`](../../.env.example) 逐一说明了每个变量，而 `pnpm dev` 完全不需要 `.env`，直接使用 localhost 默认值。

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

直播播放是浏览器直连 MediaMTX。Connect 搬运 JSON，外加录像和缩略图：从磁盘读取，或是从 MediaMTX 回放服务器代理过来的已录制时段。

## 文档

| | |
|---|---|
| [功能清单](../../docs/FEATURES.md) | 已交付的全部能力、路由与过程 |
| [架构](../../docs/ARCHITECTURE.md) | 各部分如何组合 |
| [参与贡献](../../CONTRIBUTING.md) | 开发环境、脚本与 PR 流程 |
| [示例](../../examples/) | 树莓派摄像头、用于测试的模拟流 |

## 参与贡献

欢迎提 issue 和 PR。`pnpm install && pnpm dev` 会带起完整栈并预置示例数据。详见 [CONTRIBUTING.md](../../CONTRIBUTING.md)，另外 PR 标题需遵循 conventional commits。我们遵守[行为准则](../../CODE_OF_CONDUCT.md)。

## 许可证

[MIT](../../LICENSE)
