<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
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

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>용 웹 인터페이스입니다. 브라우저에서 스트림을 보고, 녹화를 탐색하며, 설정을 편집할 수 있습니다.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect 데모" width="720">
</p>

## 실행 방법

이미지는 `linux/amd64`와 `linux/arm64`(Raspberry Pi, Apple Silicon 등) 모두에 대해 배포되며, Docker가 알맞은 것을 자동으로 내려받습니다.

이미 MediaMTX를 실행 중인가요? 그 옆에 Connect를 추가하세요:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /녹화/경로:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL`은 Connect가 컨테이너 *내부*에서 MediaMTX API에 접근하는 주소입니다. 기본값은 `http://mediamtx`이며, 함께 제공되는 compose 네트워크에서만 확인됩니다. 단독으로 `docker run`을 사용할 때는 사용 중인 MediaMTX 호스트로 설정하세요(나중에 **Config**에서 변경할 수도 있습니다).

아직 MediaMTX가 없나요? 함께 제공되는 compose가 둘을 같이 시작합니다:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000을 열고 **Config**로 이동한 뒤, MediaMTX를 가리키도록 설정하세요.

> Connect는 `mediamtx.yml`에 `api: yes`가 필요합니다. 동작 예시는 [포함된 파일](../../mediamtx.yml)을 참고하세요.

### 설정

모든 항목은 **Config**에서 실행 중에 설정할 수 있습니다. 아래 환경 변수는 최초 부팅 시 초기값을 지정할 뿐입니다:

| 변수 | 기본값 | 용도 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect 컨테이너에서 접근 가능한 MediaMTX API 호스트 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API 포트 |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 녹화를 위해 마운트하는 호스트 경로(compose 전용, 선택 사항 — 설정하지 않으면 기본값 사용) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 생성된 스크린샷이 저장되는 위치 |

## 문서

[아키텍처](../../ARCHITECTURE.md) · [기능](../../docs/FEATURES.md) · [기여하기](../../CONTRIBUTING.md)

> 참고: 개발자 문서는 영어로만 유지됩니다. 애플리케이션 UI는 `/ko`에서 한국어로 제공됩니다.

## 행동 강령

이 프로젝트는 [행동 강령](../../CODE_OF_CONDUCT.md)을 따릅니다. 참여함으로써 이를 준수할 것으로 기대됩니다.

## 라이선스

MIT
