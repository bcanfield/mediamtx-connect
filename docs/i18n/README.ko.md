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
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>용 웹 인터페이스입니다. 브라우저에서 스트림을 보고, 녹화를 탐색하며, 설정을 편집할 수 있습니다.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect 데모" width="720">
</p>

## 실행 방법

이미 MediaMTX를 실행 중인가요? 그 옆에 Connect를 추가하세요:

```bash
docker run -d \
  -p 3000:3000 \
  -v /녹화/경로:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

아직 MediaMTX가 없나요? 함께 제공되는 compose가 둘을 같이 시작합니다:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000을 열고 **Config**로 이동한 뒤, MediaMTX를 가리키도록 설정하세요.

> Connect는 `mediamtx.yml`에 `api: yes`가 필요합니다. 동작 예시는 [포함된 파일](../../mediamtx.yml)을 참고하세요.

## 문서

[아키텍처](../../ARCHITECTURE.md) · [기능](../../docs/FEATURES.md) · [기여하기](../../CONTRIBUTING.md)

> 참고: 개발자 문서는 영어로만 유지됩니다. 애플리케이션 UI는 `/ko`에서 한국어로 제공됩니다.

## 라이선스

MIT
