<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>를 위한 웹 UI.</strong><br>
브라우저에서 라이브 스트림을 보고, 녹화를 훑어보고, MediaMTX 설정을 편집하세요.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — 라이브 스트림 그리드, 녹화 브라우저, 설정 편집기" width="860">

<details>
<summary>🌍 30개 언어로 보기</summary>
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
  🇰🇷 <strong>한국어</strong> •
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

## 무엇인가

MediaMTX는 훌륭한 스트리밍 서버지만 UI가 없습니다. Connect는 그 빠진 프런트엔드입니다. MediaMTX API와 대화하는 컨테이너 하나가 이를 카메라 월, 녹화 보관소, 설정 편집기로 바꿔 줍니다.

대체재가 아니라 동반자입니다. 모든 화면은 MediaMTX가 이미 노출하는 것에 대응합니다. path, API 엔드포인트, `runOn*` 훅, 자체적으로 제공하는 프로토콜. 영상을 저장하지도, 미디어를 중계하지도, 데이터베이스를 쓰지도 않습니다.

## 빠른 시작

멀티아크 이미지(`linux/amd64`, `linux/arm64`). Docker가 알맞은 것을 받아 옵니다.

**이미 MediaMTX가 돌고 있나요?** 옆에 Connect를 붙이세요:

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

**아무것도 없이 시작하나요?** 함께 들어 있는 compose가 Connect를 빌드해 MediaMTX 옆에서 실행합니다:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

그다음 <http://localhost:3000>을 여세요.

> [!IMPORTANT]
> Connect는 `mediamtx.yml`에 `api: yes`가 있어야 합니다. [포함된 설정](../../mediamtx.yml)은 그대로 동작합니다.

## 무엇을 얻나

### 라이브 뷰

MediaMTX가 알고 있는 모든 path를 2~4열 그리드로.

- **카드마다 WebRTC 또는 HLS.** `AUTO`는 조용히 대체 방식으로 넘어가고, `LOW-LAT`은 WebRTC를 고집하며, `COMPAT`은 HLS를 강제합니다. 각 카드는 실제로 확보한 전송 방식을 표시합니다.
- **멈춰 있어도 스냅샷.** 백그라운드 작업이 모든 카드에 최근 프레임을 유지하고, 그 경과 시간을 배지에 표시합니다. 지금 바로 새 것이 필요하면 카드 메뉴에서 찍으세요.
- **실시간 텔레메트리.** 코덱, 시청자 수, 가동 시간을 path 목록에서 그대로.
- **정직한 녹화 상태.** 카드는 스트림이 *실제로* 녹화 중인지 보여 줍니다. Connect가 읽지 못한 상태는 꺼짐이 아니라 알 수 없음입니다.
- **퍼블리시 URL을 클립보드로.** RTSP·RTMP·SRT를 서버 자신의 리슨 주소로 만들어 냅니다. 각 path 페이지에는 퍼블리시 및 읽기 패널이 더 있습니다. WHIP, WHEP, HLS, TLS 변형을 포함해 서버가 제공하는 모든 프로토콜을, 바로 복사할 수 있는 ffmpeg·GStreamer·OBS·ffplay·VLC 스니펫과 함께 보여 줍니다.

### 녹화

- MediaMTX 재생 서버에서 가져온 스트림별 하루 타임라인. 녹화된 구간과 그 사이의 빈틈을 보여 주며, 각 구간을 재생할 수 있습니다. 재생이 꺼져 있으면 Connect가 필요한 설정 변경을 정확히 나열하고 한 번의 클릭으로 적용합니다.
- 클립 다운로드. 최대 1시간까지의 임의 범위(또는 최근 5분, 15분, 1시간)를 하나의 평범한 MP4로 받으며, MediaMTX가 재인코딩 없이 세그먼트를 이어 붙입니다.
- 스트림별 MP4 또는 MPEG-TS 세그먼트를 날짜로 묶고, 썸네일은 자동 생성.
- 자리에서 펼쳐지는 인라인 플레이어. HTTP Range 요청으로 탐색됩니다.
- 실시간 진행률과 취소를 갖춘 스트리밍 다운로드.
- `/`를 누르면 필터가 열립니다.

### 세션

- **접속한 모두를 하나의 표로.** RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC, HLS의 퍼블리셔와 리더를 원격 주소, 수신·송신 바이트, 접속 시간과 함께 보여 주며 5초마다 새로 고칩니다.
- **클라이언트 내보내기**는 확인 후 실행됩니다. 다시 접속할 수 있으며, 내보내기는 차단이 아닙니다.

### YAML 없는 설정

- **서버 설정:** Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC, SRT에 걸친 타입과 검증을 갖춘 66개 컨트롤.
- **path 기본값과 path별 오버라이드**를 MediaMTX가 제공하는 스코프에서. 와일드카드로 덮인 스트림을 저장하면 희소 항목이 기록되어, 건드리지 않은 키는 계속 기본값을 따릅니다.
- **path 카탈로그.** 라이브 및 정규식 배지, 안내형 "RTSP 카메라 추가" 양식, 그리고 어떤 path든 고유 항목의 되돌리기나 삭제(누군가 접속 중이면 경고)를 제공합니다.
- **각 path 페이지의 실시간 상태:** 트랙, 리더, 전송 바이트, 오류 프레임, 가동 시간을 5초마다 새로 고칩니다. 아무것도 퍼블리시하지 않는 path는 고장이 아니라 유휴 상태로 표시됩니다.
- **각 path의 복원력:** 카메라가 꺼져 있는 동안 오프라인 클립을 반복 재생하는 항상 사용 가능한 폴백, 그리고 누군가 볼 때만 소스를 여는 온디맨드 가져오기.
- **모든 `runOn*` 훅.** 저장 시 path가 재시작되는 곳에는 경고가 붙습니다.
- **포워딩:** MediaMTX 기본 `forward` 목록을 통해 path를 YouTube, Twitch 또는 다른 서버로 내보냅니다. 스트림 키는 가려지고 path는 재시작되지 않습니다.
- **희소 쓰기.** 바꾼 키만 전송됩니다.

### 운영

API·SPA·미디어를 한 프로세스로 · 멀티아크 · `GET /api/health` · 헤더에 MediaMTX 버전 · 구조화 로그 · PWA로 설치 가능 · 다크와 라이트 · 30개 언어 · 데이터베이스 없음.

## 환경 변수

첫 부팅의 초깃값만 정합니다. 이후로는 모두 **Config**에서 바꿀 수 있습니다.

| 변수 | 이미지 기본값 | 용도 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect가 MediaMTX API에 닿는 주소 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 포트 |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | *브라우저*가 재생을 위해 MediaMTX에 닿는 주소. 브라우저가 서버에 있지 않다면 항상 설정하세요 |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Connect가 녹화를 읽는 위치 |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 스냅샷과 썸네일이 저장되는 위치 |
| `DATA_DIR` | `/data` | `config.json`이 있는 위치 |
| `PORT` | `3000` | HTTP 포트 |
| `LOG_LEVEL` | `info` | Pino 로그 레벨 |

`http://mediamtx`는 함께 제공되는 compose 네트워크에서만 해석됩니다. 단독 `docker run`이라면 본인의 호스트를 가리키세요. compose에서는 `REMOTE_MEDIAMTX_URL` 대신 `.env`에 `REMOTE_MEDIAMTX_HOST`를 설정하세요. 이 값은 MediaMTX가 알리는 WebRTC 호스트도 설정합니다. [`.env.example`](../../.env.example)에 각 변수가 설명되어 있으며, `pnpm dev`는 `.env` 없이 localhost 기본값을 사용합니다.

## 동작 방식

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

라이브 재생은 브라우저에서 MediaMTX로 직접 갑니다. Connect는 JSON과 함께 녹화와 썸네일을 옮깁니다. 디스크에서 읽거나, MediaMTX 재생 서버의 녹화 구간을 중계합니다.

## 문서

| | |
|---|---|
| [기능 목록](../../docs/FEATURES.md) | 출시된 모든 기능, 라우트, 프로시저 |
| [아키텍처](../../docs/ARCHITECTURE.md) | 구성 요소가 맞물리는 방식 |
| [기여하기](../../CONTRIBUTING.md) | 개발 환경, 스크립트, PR 절차 |
| [예제](../../examples/) | 라즈베리 파이 카메라, 테스트용 가짜 스트림 |

## 기여하기

이슈와 PR을 환영합니다. `pnpm install && pnpm dev`로 시드 데이터가 들어간 전체 스택이 뜹니다. [CONTRIBUTING.md](../../CONTRIBUTING.md)를 보시고, PR 제목은 conventional commits를 따른다는 점에 유의하세요. 저희는 [행동 강령](../../CODE_OF_CONDUCT.md)을 지킵니다.

## 라이선스

[MIT](../../LICENSE)
