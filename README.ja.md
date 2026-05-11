<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <a href="./README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <a href="./README.fr.md">Français</a> •
  🇵🇹 <a href="./README.pt.md">Português</a> •
  🇯🇵 <strong>日本語</strong> •
  🇵🇱 <a href="./README.pl.md">Polski</a> •
  🇰🇷 <a href="./README.ko.md">한국어</a> •
  🇹🇷 <a href="./README.tr.md">Türkçe</a> •
  🇳🇱 <a href="./README.nl.md">Nederlands</a> •
  🇨🇿 <a href="./README.cs.md">Čeština</a>
</p>

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a> 用のウェブインターフェース。ブラウザでストリームを視聴し、録画を閲覧し、設定を編集できます。</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src=".github/assets/demo.gif" alt="MediaMTX Connect デモ" width="720">
</p>

## 実行方法

すでに MediaMTX を稼働させていますか?隣に Connect を立ち上げてください:

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

MediaMTX をまだ用意していない場合、同梱の compose で両方を起動できます:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000 を開き、**Config** で MediaMTX を指定してください。

> Connect には `mediamtx.yml` の `api: yes` が必要です。動作するリファレンスとして[同梱ファイル](mediamtx.yml)を参照してください。

## ドキュメント

[アーキテクチャ](ARCHITECTURE.md) · [機能](docs/FEATURES.md) · [コントリビュート](CONTRIBUTING.md)

> 注: 開発者向けドキュメントは英語のみで管理しています。アプリの UI は `/ja` で日本語をご利用いただけます。

## ライセンス

MIT
