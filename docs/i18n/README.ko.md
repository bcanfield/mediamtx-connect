<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>를 위한 웹 UI.</strong><br>
브라우저에서 라이브 스트림을 보고, 녹화를 훑어보고, 모든 설정 키를 편집하세요.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — 라이브 스트림 그리드, 녹화 브라우저, 설정 편집기" width="860">

</div>

## 무엇인가

MediaMTX는 훌륭한 스트리밍 서버지만 UI가 없습니다. Connect는 그 빠진 프런트엔드입니다. MediaMTX API와 대화하는 컨테이너 하나가 카메라 월, 녹화 보관소, 설정 편집기로 바꿔 줍니다.

대체재가 아니라 동반자입니다. 모든 화면은 MediaMTX가 이미 노출하는 것 — path, API 엔드포인트, `runOn*` 훅, 자체적으로 제공하는 프로토콜 — 위에 얹혀 있습니다. Connect는 영상을 저장하지도, 미디어를 중계하지도, 데이터베이스를 쓰지도 않습니다. 실행 중인 서버를 가리키면 그대로 동작합니다.

## 빠른 시작

이미지는 `linux/amd64`와 `linux/arm64`(라즈베리 파이, 애플 실리콘 등)용으로 배포되므로 Docker가 알맞은 것을 받아 옵니다.

**이미 MediaMTX가 돌고 있나요?** 옆에 Connect를 붙이세요:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**아무것도 없이 시작하나요?** 함께 들어 있는 compose가 둘 다 띄웁니다:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

어느 쪽이든 <http://localhost:3000>을 여세요.

> [!IMPORTANT]
> Connect는 `mediamtx.yml`에 `api: yes`가 있어야 합니다. 읽기와 쓰기 모두 그 API를 지나갑니다. [포함된 설정](../../mediamtx.yml)이 동작하는 예시입니다.

## 무엇을 얻나

### 라이브 뷰

MediaMTX가 알고 있는 모든 path를 2·3·4열 그리드로 보여 줍니다.

- **카드마다 WebRTC 또는 HLS.** `AUTO`는 WebRTC를 선호하되 조용히 HLS로 내려가고, `LOW-LAT`은 WebRTC를 고집하며, `COMPAT`은 HLS를 강제합니다. 각 카드는 자기 연결을 협상하고 실제로 확보한 전송 방식을 표시합니다 — 요청한 방식이 아니라요.
- **멈춰 있어도 스냅샷.** 백그라운드 작업이 모든 스트림에서 프레임을 뽑아 두므로 재생하지 않는 카드도 현장을 보여 주고, 프레임의 경과 시간이 배지에 표시됩니다. 「스냅샷 찍기」로 즉시 한 장 받을 수 있습니다.
- **실시간 텔레메트리.** 코덱 칩, 시청자 수, 가동 시간을 path 목록에서 그대로 가져옵니다 — 추가 요청은 없습니다.
- **사실대로 말하는 녹화 상태.** 카드는 스트림이 *실제로* 녹화 중인지 보여 줍니다(자체 오버라이드를 path 기본값 위에 병합한, MediaMTX와 같은 해석 방식). 읽지 못한 상태는 꺼짐이 아니라 알 수 없음으로 표시합니다.
- **퍼블리시 URL을 클립보드로.** RTSP·RTMP·SRT 대상은 서버 자신의 리슨 주소로 만들어지므로, 포트를 바꿨더라도 여전히 올바른 포트입니다.

### 녹화

- 스트림별 MP4를 날짜로 묶어 최신순으로, 자동 생성된 썸네일과 함께 보여 줍니다.
- 자리에서 펼쳐지는 인라인 플레이어. HTTP Range 요청 기반의 진짜 탐색 바가 붙어 있습니다.
- 진행률과 속도를 실시간으로 보여 주고 취소도 되는 스트리밍 다운로드.
- 어디서든 `/`를 누르면 필터가 열립니다.

### YAML 없는 설정

- **서버 설정 전부** — Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT에 걸친 65개 컨트롤. 모두 타입이 있고 검증되며 사용자의 언어로 설명이 붙습니다.
- **path 기본값과 path별 오버라이드**를 MediaMTX가 실제로 제공하는 스코프에서 편집합니다. 와일드카드로 덮인 스트림을 저장하면 희소 항목이 생성되어, 건드리지 않은 키는 계속 기본값을 따릅니다 — 「상속으로 되돌리기」로 취소할 수 있습니다.
- **15개 `runOn*` path 훅 전부.** 저장 시 path가 재시작되는 곳에는 경고가 붙습니다.
- **희소 쓰기.** Connect는 바꾼 키만 PATCH합니다. 노출하지 않는 항목은 건드리지 않습니다.

### 잊고 지낼 수 있는 장비를 위해

API·SPA·미디어를 한 프로세스로 제공 · 멀티아크 이미지 · `GET /health` · 구조화 로그 · 설치 가능한 PWA · 라이트/다크 테마 · 30개 언어 · 데이터베이스 없음.

## 환경 변수

아래 값은 모두 **Config**에서 실행 중에 바꿀 수 있습니다. 환경 변수는 첫 부팅의 초깃값만 정합니다.

| 변수 | 기본값 | 용도 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect가 컨테이너 *내부*에서 MediaMTX API에 닿는 주소 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 포트 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 녹화를 위해 마운트하는 호스트 경로(compose 전용) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 생성된 썸네일이 저장되는 위치 |

기본값 `http://mediamtx`는 함께 제공되는 compose 네트워크에서만 해석됩니다. 단독 `docker run`이라면 본인의 MediaMTX 호스트로 지정하세요 — 나중에 **Config**에서 고쳐도 되고, 재시작은 필요 없습니다.

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

재생은 브라우저에서 MediaMTX로 바로 연결됩니다. Connect가 옮기는 것은 JSON, 그리고 디스크에서 읽는 녹화와 썸네일뿐입니다.

## 문서

| | |
|---|---|
| [기능 목록](../FEATURES.md) | 출시된 모든 기능, 라우트, 프로시저 |
| [아키텍처](../../ARCHITECTURE.md) | 구성 요소가 맞물리는 방식 |
| [기여하기](../../CONTRIBUTING.md) | 개발 환경, 스크립트, PR 절차 |
| [예제](../../examples/) | 라즈베리 파이 카메라, 테스트용 가짜 스트림 |

## 기여하기

이슈와 PR을 환영합니다. `pnpm install && pnpm dev`로 시드 데이터가 들어간 전체 스택이 뜹니다 — 나머지는 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 보세요. PR 제목은 [conventional commits](../../CONTRIBUTING.md)를 따릅니다. 이 프로젝트는 [행동 강령](../../CODE_OF_CONDUCT.md)을 따릅니다.

## 라이선스

[MIT](../../LICENSE)
