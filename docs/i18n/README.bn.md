<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>-এর ওয়েব UI।</strong><br>
লাইভ স্ট্রিম দেখুন, রেকর্ডিং ঘেঁটে দেখুন, যেকোনো কনফিগ কি বদলান — আপনার ব্রাউজার থেকেই।</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — লাইভ স্ট্রিমের গ্রিড, রেকর্ডিং ব্রাউজার আর কনফিগ সম্পাদক" width="860">

<details>
<summary>🌍 ৩০টি ভাষায় পড়ুন</summary>
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
  🇧🇩 <strong>বাংলা</strong>
</p>
</details>

</div>

## এটা কী

MediaMTX চমৎকার একটা স্ট্রিমিং সার্ভার, তবে কোনো ইন্টারফেস ছাড়াই। Connect হলো সেই অনুপস্থিত ফ্রন্ট-এন্ড: একটামাত্র কনটেইনার, যা MediaMTX-এর API-র সঙ্গে কথা বলে আর তাকে বানিয়ে ফেলে ক্যামেরার দেয়াল, রেকর্ডিংয়ের আর্কাইভ আর কনফিগ সম্পাদক।

এটা সঙ্গী, বিকল্প নয়। প্রতিটা স্ক্রিন দাঁড়িয়ে আছে এমন কিছুর উপর যা MediaMTX আগে থেকেই খুলে রেখেছে: একটা path, একটা API এন্ডপয়েন্ট, একটা `runOn*` হুক, কিংবা এমন প্রোটোকল যা সে নিজেই পরিবেশন করে। ভিডিও জমায় না, মিডিয়া প্রক্সি করে না, ডেটাবেসও রাখে না।

## ঝটপট শুরু

বহু-আর্কিটেকচার ইমেজ (`linux/amd64`, `linux/arm64`) — Docker সঠিকটা নামিয়ে নেয়।

**MediaMTX আগে থেকেই চলছে?** পাশে Connect বসিয়ে দিন:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**শূন্য থেকে শুরু করছেন?** সঙ্গে দেওয়া compose দুটোই দাঁড় করিয়ে দেয়:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

তারপর <http://localhost:3000> খুলুন।

> [!IMPORTANT]
> Connect-এর জন্য আপনার `mediamtx.yml`-এ `api: yes` দরকার। [সঙ্গে দেওয়া কনফিগারেশন](../../mediamtx.yml) যেমন আছে তেমনই চলে।

## আপনি কী পাবেন

### লাইভ দৃশ্য

MediaMTX যত path চেনে তার সবগুলো, ২ থেকে ৪ কলামের গ্রিডে।

- **কার্ড ধরে ধরে WebRTC কিংবা HLS।** `AUTO` চুপচাপ HLS-এ নেমে আসে, `LOW-LAT` WebRTC-তেই অটল থাকে, আর `COMPAT` HLS চাপিয়ে দেয় — আর প্রতিটা কার্ড জানায় কোন ট্রান্সপোর্ট আসলে পেয়েছে।
- **নিষ্ক্রিয় থাকলেও স্ন্যাপশট।** পটভূমির একটা কাজ প্রতিটা কার্ডে টাটকা একটা ফ্রেম রেখে দেয়, আর তার বয়স লেবেলে লেখা থাকে।
- **সরাসরি টেলিমেট্রি।** কোডেক, দর্শকসংখ্যা আর অনলাইন থাকার সময় — সোজা path তালিকা থেকে।
- **সৎ রেকর্ডিং অবস্থা।** কার্ড দেখায় স্ট্রিমটা *সত্যিই* রেকর্ড করছে কি না; Connect যে অবস্থা পড়তে পারেনি সেটাকে বলে অজানা, বন্ধ কখনো নয়।
- **পাবলিশ URL সোজা ক্লিপবোর্ডে।** RTSP, RTMP আর SRT, সার্ভারের নিজের লিসন ঠিকানা থেকে তৈরি।

### রেকর্ডিং

- প্রতিটা স্ট্রিমের MP4, দিন ধরে সাজানো, স্বয়ংক্রিয় থাম্বনেইল সহ।
- জায়গাতেই খুলে যাওয়া প্লেয়ার, HTTP Range অনুরোধে এগিয়ে-পিছিয়ে নেওয়া যায়।
- স্ট্রিম হতে হতে ডাউনলোড, সরাসরি অগ্রগতি আর বাতিলের সুযোগসহ।
- ছাঁকতে `/` চাপুন।

### YAML ছাড়াই কনফিগারেশন

- **গোটা সার্ভার কনফিগারেশন** — Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC আর SRT জুড়ে ৬৫টা টাইপযুক্ত, যাচাই করা নিয়ন্ত্রণ।
- **path defaults আর প্রতি path-এর নিজস্ব ওভাররাইড**, সেই পরিসরে যেখান থেকে MediaMTX সেগুলো পরিবেশন করে। ওয়াইল্ডকার্ডে ঢাকা স্ট্রিম সেভ করলে একটা হালকা এন্ট্রি লেখা হয়, তাই না-ছোঁয়া কি-গুলো উত্তরাধিকার পেতেই থাকে।
- **সবকটা ১৫টা `runOn*` হুক**, আর যেখানে সেভ করলে path আবার চালু হয় সেখানে সতর্কবার্তা।
- **হালকা লেখা** — কেবল যেসব কি আপনি বদলেছেন।

### পরিচালনা

API, SPA আর মিডিয়ার জন্য একটামাত্র প্রসেস · বহু-আর্কিটেকচার · `GET /health` · কাঠামোবদ্ধ লগ · PWA · হালকা ও গাঢ় · ৩০টি ভাষা · কোনো ডেটাবেস নেই।

## এনভায়রনমেন্ট ভেরিয়েবল

এগুলো কেবল প্রথম বুটের বীজ বোনে। বাকিটা **Config**-এ বদলানো যায়।

| ভেরিয়েবল | ডিফল্ট | কী কাজে |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect নিজের কনটেইনারের ভিতর থেকে MediaMTX API-তে কোথায় পৌঁছায় |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API-র পোর্ট |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | রেকর্ডিংয়ের জন্য মাউন্ট করা হোস্ট পাথ (কেবল compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | থাম্বনেইল কোথায় জমা হয় |

`http://mediamtx` কেবল সঙ্গে দেওয়া compose-এর নেটওয়ার্কেই মেলে — আলাদা `docker run`-এর বেলায় নিজের হোস্ট বসান।

## এটা কীভাবে কাজ করে

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

প্লেব্যাক ব্রাউজার থেকে MediaMTX-এ যায়। Connect কেবল JSON টানে, আর সঙ্গে ডিস্ক থেকে পড়া রেকর্ডিং ও থাম্বনেইল।

## নথিপত্র

| | |
|---|---|
| [বৈশিষ্ট্য](../FEATURES.md) | প্রকাশিত প্রতিটি সক্ষমতা, রুট আর প্রসিডিওর |
| [আর্কিটেকচার](../../ARCHITECTURE.md) | টুকরোগুলো কীভাবে জোড়া লাগে |
| [অবদান](../../CONTRIBUTING.md) | ডেভ সেটআপ, স্ক্রিপ্ট, PR প্রক্রিয়া |
| [উদাহরণ](../../examples/) | Raspberry Pi ক্যামেরা, পরীক্ষার জন্য নকল স্ট্রিম |

## অবদান

ইস্যু আর PR — দুটোকেই স্বাগত। `pnpm install && pnpm dev` আপনাকে নমুনা ডেটাসহ গোটা স্ট্যাক দাঁড় করিয়ে দেয় — বাকিটা [CONTRIBUTING.md](../../CONTRIBUTING.md)-এ, আর PR-এর শিরোনাম conventional commits মেনে চলে। আমরা একটি [আচরণবিধি](../../CODE_OF_CONDUCT.md) মেনে চলি।

## লাইসেন্স

[MIT](../../LICENSE)
