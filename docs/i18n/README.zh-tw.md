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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect —— 直播牆、錄影瀏覽器與設定編輯器" width="860">

</div>

## 這是什麼

MediaMTX 是一套出色的串流伺服器，但它不附介面。Connect 就是它缺的那個前端：一個容器，對接 MediaMTX API，把它變成一面監控牆、一座錄影庫和一個設定編輯器。

它是夥伴，不是替代品。每個畫面都對應 MediaMTX 本來就公開的東西 —— 一條 path、一個 API 端點、一個 `runOn*` hook、一種它原生提供的協定。Connect 不存影片、不代理媒體、不用資料庫。指向一台執行中的伺服器就能用。

## 快速開始

映像檔同時發佈 `linux/amd64` 與 `linux/arm64`（Raspberry Pi、Apple Silicon 等），Docker 會自動抓取正確的那一個。

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

不論哪一種，打開 <http://localhost:3000>。

> [!IMPORTANT]
> Connect 需要你的 `mediamtx.yml` 裡有 `api: yes` —— 它所有的讀寫都走這個 API。[內附的設定](../../mediamtx.yml)是一份可用的參考。

## 你會得到什麼

### 即時畫面

MediaMTX 已知的每一條 path 都在格狀版面裡，可切換 2、3、4 欄。

- **逐張卡片選擇 WebRTC 或 HLS。** `AUTO` 優先 WebRTC 並靜默退回 HLS，`LOW-LAT` 堅持走 WebRTC，`COMPAT` 強制 HLS。每張卡片各自協商連線，並顯示實際用上的傳輸方式 —— 而不是你要求的那一種。
- **閒置時也有快照。** 背景工作會為每條串流擷取畫面，因此未播放的卡片依然看得到現場，標籤上還帶著這一格的時間。「立即擷取」可隨時抓一張。
- **即時遙測。** 編解碼標籤、觀看人數與上線時間，全部取自 path 清單 —— 不產生額外請求。
- **照實顯示的錄影狀態。** 卡片顯示的是串流*實際上*是否在錄影（它自己的覆寫疊在 path 預設值之上，與 MediaMTX 的解析方式一致）；讀不到的狀態顯示為未知，而不是顯示成關閉。
- **推流網址一鍵複製。** RTSP、RTMP 與 SRT 位址由伺服器自己的監聽位址組出來，所以改過的連接埠依然是對的連接埠。

### 錄影

- 每條串流的 MP4，依日期分組、最新在前，並自動產生縮圖。
- 就地展開的內嵌播放器，配一條真正能拖曳的進度條，底層是 HTTP Range 請求。
- 邊下載邊顯示進度、速度，並可隨時取消的串流式下載。
- 在任何地方按 `/` 就能過濾。

### 設定，不必寫 YAML

- **完整的伺服器設定** —— Logging、API、Hooks、RTSP、RTMP、HLS、WebRTC、SRT 共 65 個控制項，每一個都有型別、有驗證，並以你的語言提供說明。
- **path 預設值與逐 path 覆寫**，都落在 MediaMTX 真正提供它們的範圍上。儲存一條由萬用字元涵蓋的串流會產生一筆稀疏項目，沒改動的鍵繼續跟著預設值 ——「還原為繼承」可以撤銷。
- **全部 15 個 `runOn*` path hook**，凡是儲存後會重啟 path 的地方都有提示。
- **稀疏寫入。** Connect 只 PATCH 你改過的鍵；沒有公開的部分原封不動。

### 為一台你可以忘掉的機器而設計

單一行程同時提供 API、SPA 與媒體 · 多架構映像檔 · `GET /health` · 結構化日誌 · 可安裝的 PWA · 淺色與深色主題 · 30 種語言 · 免資料庫。

## 環境變數

這些都能在 **Config** 裡隨時調整 —— 環境變數只提供首次啟動的初始值。

| 變數 | 預設值 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 從其容器*內部*連到 MediaMTX API 的位址 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 連接埠 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 掛載錄影的主機路徑（僅 compose） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 產生的縮圖存放位置 |

預設值 `http://mediamtx` 只在內附 compose 的網路裡才解析得到。單獨使用 `docker run` 時，請設成你的 MediaMTX 主機 —— 或之後在 **Config** 裡改，不必重啟。

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

歡迎提出 issue 與 PR。`pnpm install && pnpm dev` 會帶起完整堆疊並預先塞好範例資料 —— 其餘請見 [CONTRIBUTING.md](../../CONTRIBUTING.md)，另外 PR 標題需符合 [conventional commits](../../CONTRIBUTING.md)。本專案遵守[行為準則](../../CODE_OF_CONDUCT.md)。

## 授權

[MIT](../../LICENSE)
