<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>-এর ওয়েব UI।</strong><br>
লাইভ স্ট্রিম দেখুন, রেকর্ডিং ঘেঁটে দেখুন, আর আপনার MediaMTX কনফিগ বদলান ব্রাউজার থেকেই।</p>

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

MediaMTX চমৎকার একটা স্ট্রিমিং সার্ভার, তবে কোনো UI ছাড়াই। Connect হলো সেই অনুপস্থিত ফ্রন্ট এন্ড: একটামাত্র কনটেইনার, যা MediaMTX-এর API-র সঙ্গে কথা বলে আর তাকে বানিয়ে ফেলে ক্যামেরার দেয়াল, রেকর্ডিংয়ের আর্কাইভ আর কনফিগ সম্পাদক।

এটা সঙ্গী, বিকল্প নয়। প্রতিটা স্ক্রিন এমন কিছুর সঙ্গে মেলে যা MediaMTX আগে থেকেই খুলে রেখেছে: একটা path, একটা API এন্ডপয়েন্ট, একটা `runOn*` হুক, কিংবা এমন প্রোটোকল যা সে নিজেই পরিবেশন করে। ভিডিও জমায় না, মিডিয়া প্রক্সি করে না, ডেটাবেসও রাখে না।

## ঝটপট শুরু

বহু-আর্কিটেকচার ইমেজ (`linux/amd64`, `linux/arm64`); Docker সঠিকটা নামিয়ে নেয়।

**MediaMTX আগে থেকেই চলছে?** পাশে Connect বসিয়ে দিন:

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

**শূন্য থেকে শুরু করছেন?** সঙ্গে দেওয়া compose Connect বিল্ড করে আর MediaMTX-এর পাশে চালায়:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

তারপর <http://localhost:3000> খুলুন।

> [!IMPORTANT]
> Connect-এর জন্য আপনার `mediamtx.yml`-এ `api: yes` দরকার। [সঙ্গে দেওয়া কনফিগ](../../mediamtx.yml) যেমন আছে তেমনই চলে।

## আপনি কী পাবেন

### লাইভ দৃশ্য

MediaMTX যত path চেনে তার সবগুলো, ২ থেকে ৪ কলামের গ্রিডে।

- **কার্ড ধরে ধরে WebRTC কিংবা HLS।** `AUTO` চুপচাপ বিকল্পে নেমে আসে, `LOW-LAT` WebRTC-তেই অটল থাকে, আর `COMPAT` HLS চাপিয়ে দেয়। প্রতিটা কার্ড জানায় কোন ট্রান্সপোর্ট আসলে পেয়েছে।
- **নিষ্ক্রিয় থাকলেও স্ন্যাপশট।** পটভূমির একটা কাজ প্রতিটা কার্ডে সাম্প্রতিক একটা ফ্রেম রেখে দেয়, আর তার বয়স লেবেলে লেখা থাকে। এখনই টাটকা একটা চাই? কার্ডের মেনু থেকে তুলে নিন।
- **সরাসরি টেলিমেট্রি।** কোডেক, দর্শকসংখ্যা আর আপটাইম, সোজা path তালিকা থেকে।
- **সৎ রেকর্ডিং অবস্থা।** কার্ড দেখায় স্ট্রিমটা *সত্যিই* রেকর্ড করছে কি না; Connect যে অবস্থা পড়তে পারেনি সেটাকে বলে অজানা, বন্ধ কখনো নয়।
- **পাবলিশ URL সোজা ক্লিপবোর্ডে।** RTSP, RTMP আর SRT, সার্ভারের নিজের লিসন ঠিকানা থেকে তৈরি। প্রতিটা path-এর পাতা আরও এগিয়ে যায় একটা পাবলিশ ও রিড প্যানেল দিয়ে: সার্ভার যত প্রোটোকল পরিবেশন করে তার সবকটা, WHIP, WHEP, HLS আর TLS সংস্করণগুলো সহ, সঙ্গে ffmpeg, GStreamer, OBS, ffplay আর VLC-র কপি করার মতো তৈরি স্নিপেট।

### রেকর্ডিং

- MediaMTX-এর প্লেব্যাক সার্ভার থেকে প্রতিটা স্ট্রিমের একদিনের টাইমলাইন: রেকর্ড হওয়া অংশ আর তাদের মাঝের ফাঁক, প্রতিটা অংশই চালানো যায়। প্লেব্যাক বন্ধ থাকলে Connect ঠিক কোন কোন কনফিগ বদল দরকার তার তালিকা দেয় আর এক ক্লিকে সেগুলো প্রয়োগ করে।
- ক্লিপ ডাউনলোড: এক ঘণ্টা পর্যন্ত যেকোনো পরিসর (কিংবা শেষ ৫ মিনিট, ১৫ মিনিট বা এক ঘণ্টা) একটা সাধারণ MP4 হিসেবে, যা MediaMTX রি-এনকোড না করেই সেগমেন্ট জুড়ে তৈরি করে।
- প্রতিটা স্ট্রিমের MP4 বা MPEG-TS সেগমেন্ট, দিন ধরে সাজানো, স্বয়ংক্রিয় থাম্বনেইল সহ।
- পাতার ভেতরেই একটা প্লেয়ার যা জায়গাতেই বড় হয়, HTTP range অনুরোধে এগিয়ে-পিছিয়ে নেওয়া যায়।
- স্ট্রিম হতে হতে ডাউনলোড, সরাসরি অগ্রগতি আর বাতিলের সুযোগসহ।
- ছাঁকতে `/` চাপুন।

### সেশন

- **যুক্ত থাকা সবাই, একটাই টেবিলে।** RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC আর HLS-এর পাবলিশার ও রিডার, রিমোট ঠিকানা, আসা-যাওয়া বাইট আর আপটাইম সহ, প্রতি ৫ সেকেন্ডে রিফ্রেশ হয়।
- **ক্লায়েন্টকে বের করে দিন**, নিশ্চিত করার পরে। সে আবার যুক্ত হতে পারে; বের করে দেওয়া মানে নিষেধাজ্ঞা নয়।

### YAML ছাড়াই কনফিগারেশন

- **সার্ভার কনফিগ:** Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC আর SRT জুড়ে ৬৬টা টাইপযুক্ত, যাচাই করা নিয়ন্ত্রণ।
- **path defaults আর প্রতি path-এর নিজস্ব ওভাররাইড**, সেই পরিসরে যেখান থেকে MediaMTX সেগুলো পরিবেশন করে। ওয়াইল্ডকার্ডে ঢাকা স্ট্রিম সেভ করলে একটা হালকা এন্ট্রি লেখা হয়, তাই না-ছোঁয়া কি-গুলো ডিফল্টের সঙ্গে তাল মিলিয়ে চলতে থাকে।
- **path-এর একটা ক্যাটালগ**, লাইভ আর regex ব্যাজ সহ, "একটা RTSP ক্যামেরা যোগ করুন"-এর জন্য ধাপে ধাপে ফর্ম, আর যেকোনো path-এর নিজস্ব এন্ট্রি ফিরিয়ে নেওয়া বা মুছে ফেলার সুযোগ (কেউ যুক্ত থাকলে সতর্কবার্তা সহ)।
- **প্রতিটা path-এর পাতায় সরাসরি স্বাস্থ্য:** ট্র্যাক, রিডার, আদানপ্রদান হওয়া বাইট, ত্রুটিপূর্ণ ফ্রেম আর আপটাইম, প্রতি ৫ সেকেন্ডে রিফ্রেশ হয়। যে path-এ কেউ পাবলিশ করছে না সেটা নিষ্ক্রিয় দেখায়, নষ্ট নয়।
- **প্রতিটা path-এ সহনশীলতা:** সবসময় প্রস্তুত একটা বিকল্প, যা ক্যামেরা বন্ধ থাকার সময় একটা অফলাইন ক্লিপ ঘুরিয়ে ঘুরিয়ে চালায়, আর চাহিদামতো টেনে আনা, যা কেবল কেউ দেখার সময়ই উৎস খোলে।
- **প্রতিটা `runOn*` হুক**, আর যেখানে সেভ করলে path আবার চালু হয় সেখানে সতর্কবার্তা।
- **ফরওয়ার্ডিং:** MediaMTX-এর নিজস্ব `forward` তালিকা দিয়ে একটা path YouTube, Twitch বা অন্য সার্ভারে পাঠান, স্ট্রিম কি লুকানো থাকে আর path আবার চালু হয় না।
- **হালকা লেখা।** কেবল যেসব কি আপনি বদলেছেন সেগুলোই পাঠানো হয়।

### পরিচালনা

API, SPA আর মিডিয়ার জন্য একটামাত্র প্রসেস · বহু-আর্কিটেকচার · `GET /api/health` · হেডারে MediaMTX সংস্করণ · কাঠামোবদ্ধ লগ · PWA হিসেবে ইনস্টল করা যায় · গাঢ় ও হালকা · ৩০টি ভাষা · কোনো ডেটাবেস নেই।

## এনভায়রনমেন্ট ভেরিয়েবল

এগুলো প্রথম বুটের বীজ বোনে। সবকিছুই **Config**-এ বদলানো যায়।

| ভেরিয়েবল | ইমেজে ডিফল্ট | কী কাজে |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect MediaMTX API-তে কোথায় পৌঁছায় |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API-র পোর্ট |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | প্লেব্যাকের জন্য *ব্রাউজার* MediaMTX-এ কোথায় পৌঁছায়। ব্রাউজার যখনই সার্ভারে নেই, তখনই এটা সেট করুন |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Connect কোথা থেকে রেকর্ডিং পড়ে |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | স্ন্যাপশট আর থাম্বনেইল কোথায় যায় |
| `DATA_DIR` | `/data` | `config.json` কোথায় থাকে |
| `PORT` | `3000` | HTTP পোর্ট |
| `LOG_LEVEL` | `info` | Pino-র লগ স্তর |

`http://mediamtx` কেবল সঙ্গে দেওয়া compose-এর নেটওয়ার্কেই মেলে। আলাদা `docker run`-এর বেলায় নিজের হোস্ট বসান। compose ব্যবহার করলে `REMOTE_MEDIAMTX_URL`-এর বদলে `.env`-এ `REMOTE_MEDIAMTX_HOST` সেট করুন: এটা MediaMTX যে WebRTC হোস্ট ঘোষণা করে সেটাও ঠিক করে দেয়। [`.env.example`](../../.env.example) প্রতিটার ব্যাখ্যা দেয়, আর `pnpm dev` কোনো `.env` ছাড়াই localhost ডিফল্ট ব্যবহার করে।

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

লাইভ প্লেব্যাক ব্রাউজার থেকে সরাসরি MediaMTX-এ যায়। Connect JSON টানে, সঙ্গে রেকর্ডিং আর থাম্বনেইল: ডিস্ক থেকে, কিংবা MediaMTX-এর প্লেব্যাক সার্ভার থেকে প্রক্সি করা রেকর্ড হওয়া অংশ।

## নথিপত্র

| | |
|---|---|
| [বৈশিষ্ট্য](../../docs/FEATURES.md) | প্রকাশিত প্রতিটি সক্ষমতা, রুট আর প্রসিডিওর |
| [আর্কিটেকচার](../../docs/ARCHITECTURE.md) | টুকরোগুলো কীভাবে জোড়া লাগে |
| [অবদান](../../CONTRIBUTING.md) | ডেভ সেটআপ, স্ক্রিপ্ট, PR প্রক্রিয়া |
| [উদাহরণ](../../examples/) | Raspberry Pi ক্যামেরা, পরীক্ষার জন্য নকল স্ট্রিম |

## অবদান

ইস্যু আর PR, দুটোকেই স্বাগত। `pnpm install && pnpm dev` আপনাকে ফিক্সচারসহ গোটা স্ট্যাক দাঁড় করিয়ে দেয়। [CONTRIBUTING.md](../../CONTRIBUTING.md) দেখুন, আর মনে রাখুন PR-এর শিরোনাম conventional commits মেনে চলে। আমরা একটি [আচরণবিধি](../../CODE_OF_CONDUCT.md) মেনে চলি।

## লাইসেন্স

[MIT](../../LICENSE)
