<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> のWeb UI。</strong><br>
ブラウザからライブ映像を見て、録画を探し、あらゆる設定キーを編集できます。</p>

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
  🇯🇵 <strong>日本語</strong> •
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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — ライブ映像グリッド、録画ブラウザ、設定エディタ" width="860">

</div>

## これは何か

MediaMTX は優れたストリーミングサーバーですが、UI は付いてきません。Connect はその欠けたフロントエンドです。MediaMTX の API と会話するコンテナ1つが、カメラウォール、録画アーカイブ、設定エディタに変えてくれます。

置き換えではなく相棒です。どの画面も MediaMTX がすでに公開しているもの — path、API エンドポイント、`runOn*` フック、ネイティブに提供するプロトコル — に対応しています。Connect は映像を保存せず、メディアを中継せず、データベースも持ちません。稼働中のサーバーに向けるだけで動きます。

## クイックスタート

イメージは `linux/amd64` と `linux/arm64`（Raspberry Pi、Apple Silicon など）向けに公開されているので、Docker が適切なものを取得します。

**すでに MediaMTX が動いている場合** — その隣に Connect を追加します。

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**ゼロから始める場合** — 同梱の compose が両方を起動します。

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

どちらの場合も <http://localhost:3000> を開いてください。

> [!IMPORTANT]
> Connect は `mediamtx.yml` に `api: yes` が必要です。読み書きはすべてこの API を通ります。[同梱の設定](../../mediamtx.yml)が動作する参考例です。

## 得られるもの

### ライブビュー

MediaMTX が把握しているすべての path をグリッド表示。2・3・4列を切り替えられます。

- **カードごとに WebRTC か HLS。** `AUTO` は WebRTC を優先し、黙って HLS へ落とします。`LOW-LAT` は WebRTC を要求し、`COMPAT` は HLS を強制します。各カードは自分で接続をネゴシエートし、実際に確立できたトランスポートを表示します — 要求した方ではありません。
- **停止中もスナップショット。** バックグラウンドジョブが各ストリームからフレームを取得するので、再生していないカードでも現場が見え、フレームの経過時間がピルに出ます。「スナップショットを撮る」で即座に1枚取得できます。
- **ライブのテレメトリ。** コーデックチップ、視聴者数、稼働時間を path 一覧からそのまま表示 — 追加リクエストはありません。
- **正直な録画状態。** カードはそのストリームが*実際に*録画中かを示します（path デフォルトの上に自身のオーバーライドを重ねた、MediaMTX と同じ解決方法）。読み取れなかった状態はオフではなく不明として表示します。
- **配信 URL をクリップボードへ。** RTSP・RTMP・SRT の宛先はサーバー自身のリッスンアドレスから組み立てるので、ポートを変更していても正しいポートになります。

### 録画

- 各ストリームの MP4 を日付ごとにまとめ、新しい順に表示。サムネイルは自動生成されます。
- その場で展開するインラインプレーヤー。HTTP Range リクエストに基づく本物のシークバー付き。
- 進捗・速度をリアルタイム表示し、キャンセルもできるストリーミングダウンロード。
- どこでも `/` を押せば絞り込めます。

### YAML なしの設定

- **サーバー設定のすべて** — Logging、API、Hooks、RTSP、RTMP、HLS、WebRTC、SRT にまたがる65個のコントロール。すべて型付き・検証付きで、説明はあなたの言語で表示されます。
- **path デフォルトと path ごとのオーバーライド**を、MediaMTX が実際に提供しているスコープで編集。ワイルドカード配下のストリームを保存すると疎なエントリが作られ、触っていないキーはデフォルトを追い続けます。「継承に戻す」で取り消せます。
- **15個の `runOn*` path フックすべて。** 保存すると path が再起動する箇所には警告が出ます。
- **疎な書き込み。** Connect は変更したキーだけを PATCH します。公開していない項目はそのままです。

### 忘れていられる機械のために

API・SPA・メディアを1プロセスで配信 · マルチアーキテクチャイメージ · `GET /health` · 構造化ログ · インストール可能な PWA · ライト／ダークテーマ · 30言語 · データベース不要。

## 環境変数

ここにある値はすべて **Config** から実行中に変更できます。環境変数は初回起動の初期値を与えるだけです。

| 変数 | 既定値 | 用途 |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect がコンテナの*内側*から MediaMTX API に到達する先 |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API のポート |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | 録画用にマウントするホスト側パス（compose のみ） |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | 生成したサムネイルの保存先 |

既定値の `http://mediamtx` は同梱 compose のネットワーク上でしか解決しません。単独の `docker run` では自分の MediaMTX ホストを指定してください。後から **Config** で直しても構いません（再起動不要）。

## 仕組み

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

再生はブラウザから MediaMTX へ直接つながります。Connect が運ぶのは JSON と、ディスクから読む録画・サムネイルだけです。

## ドキュメント

| | |
|---|---|
| [機能一覧](../FEATURES.md) | 出荷済みのすべての機能・ルート・プロシージャ |
| [アーキテクチャ](../../ARCHITECTURE.md) | 各部品のつながり |
| [コントリビュート](../../CONTRIBUTING.md) | 開発環境、スクリプト、PR の流れ |
| [サンプル](../../examples/) | Raspberry Pi カメラ、テスト用のダミーストリーム |

## コントリビュート

Issue も PR も歓迎です。`pnpm install && pnpm dev` でサンプルデータ入りのフルスタックが立ち上がります。詳しくは [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。PR タイトルは [conventional commits](../../CONTRIBUTING.md) に従います。本プロジェクトは[行動規範](../../CODE_OF_CONDUCT.md)に従います。

## ライセンス

[MIT](../../LICENSE)
