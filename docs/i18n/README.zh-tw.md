<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> 的 Web 介面。</strong><br>
在瀏覽器裡觀看直播、瀏覽錄影、修改任何設定項目。</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect —— 直播牆、錄影瀏覽器與設定編輯器" width="860">

<details>
<summary>🌍 用 30 種語言閱讀</summary>
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
  🇹🇼 <strong>繁體中文</strong> •
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

## 這是什麼

MediaMTX 是出色的串流伺服器，但不附介面。Connect 就是它缺的那個前端：一個容器，對接 MediaMTX API，把它變成監控牆、錄影庫和設定編輯器。

它是夥伴，不是替代品。每個畫面都對應 MediaMTX 本來就公開的東西：一條 path、一個 API 端點、一個 `runOn*` hook、一種它原生提供的協定。不存影片，不代理媒體，不用資料庫。

## 快速開始

多架構映像檔（`linux/amd64`、`linux/arm64`）—— Docker 會抓取正確的那一個。

**已經在跑 MediaMTX？** 把 Connect 擺在它旁邊：

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**從零開始？** 內附的 compose 會同時啟動兩者：

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

接著打開 <http://localhost:3000>。

> [!IMPORTANT]
> Connect 需要你的 `mediamtx.yml` 裡有 `api: yes`。[內附的設定](../../mediamtx.yml)可直接使用。

## 你會得到什麼

### 即時畫面

MediaMTX 已知的每一條 path，以 2 至 4 欄格狀排列。

- **逐張卡片選擇 WebRTC 或 HLS。** `AUTO` 靜默退回 HLS，`LOW-LAT` 堅持走 WebRTC，`COMPAT` 強制 HLS —— 每張卡片顯示的都是實際用上的傳輸方式。
- **閒置時也有快照。** 背景工作會為每張卡片留下一張近照，並在標籤上標出它的時間。
- **即時遙測。** 編解碼、觀看人數與上線時間，直接取自 path 清單。
- **誠實的錄影狀態。** 卡片顯示串流是否*實際上*在錄影；Connect 讀不到的狀態顯示為未知，絕不顯示為關閉。
- **推流網址一鍵複製。** RTSP、RTMP 與 SRT，由伺服器自己的監聽位址組出。

### 錄影

- 每條串流的 MP4，依日期分組，並自動產生縮圖。
- 就地展開的內嵌播放器，透過 HTTP Range 請求可自由拖曳。
- 串流式下載，附即時進度與取消。
- 按 `/` 就能過濾。

### 設定，不必寫 YAML

- **完整的伺服器設定** —— Logging、API、Hooks、RTSP、RTMP、HLS、WebRTC、SRT 共 65 個具型別、有驗證的控制項。
- **path 預設值與逐 path 覆寫**，落在 MediaMTX 提供它們的範圍上。儲存由萬用字元涵蓋的串流會寫入一筆稀疏項目，沒改動的鍵繼續繼承。
- **全部 15 個 `runOn*` hook**，凡是儲存後會重啟 path 的地方都有提示。
- **稀疏寫入** —— 只送出你改過的鍵。

### 維運

單一行程提供 API、SPA 與媒體 · 多架構 · `GET /health` · 結構化日誌 · PWA · 淺色與深色 · 30 種語言 · 免資料庫。

## 環境變數

只提供首次啟動的初始值。之後一切都能在 **Config** 裡調整。

| 變數 | 預設值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 從其容器內部連到 MediaMTX API 的位址 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 連接埠 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 掛載錄影的主機路徑（僅 compose） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 縮圖存放位置 |

`http://mediamtx` 只在內附 compose 的網路裡解析得到 —— 單獨使用 `docker run` 時請指向你自己的主機。

## 運作方式

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

播放是瀏覽器直連 MediaMTX。Connect 只搬 JSON，外加它從磁碟讀出的錄影與縮圖。

## 文件

| | |
|---|---|
| [功能清單](../FEATURES.md) | 已交付的所有能力、路由與程序 |
| [架構](../../ARCHITECTURE.md) | 各部分如何組合 |
| [參與貢獻](../../CONTRIBUTING.md) | 開發環境、指令稿與 PR 流程 |
| [範例](../../examples/) | Raspberry Pi 攝影機、測試用的模擬串流 |

## 參與貢獻

歡迎提出 issue 與 PR。`pnpm install && pnpm dev` 會帶起完整堆疊並預先塞好範例資料 —— 其餘請見 [CONTRIBUTING.md](../../CONTRIBUTING.md)，PR 標題需符合 conventional commits。我們遵守[行為準則](../../CODE_OF_CONDUCT.md)。

## 授權

[MIT](../../LICENSE)
