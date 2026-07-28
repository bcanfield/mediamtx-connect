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

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>-এর জন্য ওয়েব ইন্টারফেস। আপনার ব্রাউজার থেকে স্ট্রিম দেখুন, রেকর্ডিং ব্রাউজ করুন এবং কনফিগারেশন সম্পাদনা করুন।</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect ডেমো" width="720">
</p>

## কীভাবে চালাবেন

ইমেজ `linux/amd64` এবং `linux/arm64` (Raspberry Pi, Apple Silicon, ইত্যাদি) উভয়ের জন্যই প্রকাশ করা হয় — Docker স্বয়ংক্রিয়ভাবে সঠিকটি টেনে নেয়।

ইতিমধ্যে MediaMTX চালাচ্ছেন? Connect-কে তার পাশে রাখুন:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` হলো সেই ঠিকানা যেখান থেকে Connect তার কনটেইনারের *ভিতর* থেকে MediaMTX-এর API-তে পৌঁছায়। এর ডিফল্ট `http://mediamtx`, যা কেবল সঙ্গে দেওয়া compose নেটওয়ার্কেই সমাধান হয় — স্বতন্ত্র `docker run`-এর জন্য এটিকে আপনার MediaMTX হোস্টে সেট করুন (আপনি পরে **Config**-এও এটি পরিবর্তন করতে পারেন)।

এখনও MediaMTX নেই? সঙ্গে দেওয়া compose উভয়ই শুরু করে:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000 খুলুন, **Config**-এ যান, এবং এটিকে আপনার MediaMTX-এর দিকে নির্দেশ করুন।

> Connect-এর আপনার `mediamtx.yml`-এ `api: yes` প্রয়োজন। কর্মক্ষম রেফারেন্স হিসাবে [অন্তর্ভুক্ত ফাইল](../../mediamtx.yml) দেখুন।

### কনফিগারেশন

সবকিছুই **Config**-এ রানটাইমে কনফিগার করা যায়। এই env ভেরিয়েবলগুলো কেবল প্রথম বুটের প্রাথমিক মান দেয়:

| ভেরিয়েবল | ডিফল্ট | উদ্দেশ্য |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | MediaMTX API হোস্ট, যা Connect-এর কনটেইনার থেকে পৌঁছানো যায় |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API পোর্ট |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | রেকর্ডিংয়ের জন্য মাউন্ট করা হোস্ট পাথ (কেবল compose; ঐচ্ছিক — সেট না থাকলে ডিফল্ট প্রযোজ্য) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | তৈরি হওয়া স্ক্রিনশট যেখানে সংরক্ষিত হয় |

## ডকুমেন্টেশন

[আর্কিটেকচার](../../ARCHITECTURE.md) · [বৈশিষ্ট্য](../../docs/FEATURES.md) · [অবদান](../../CONTRIBUTING.md)

> দ্রষ্টব্য: ডেভেলপার ডকুমেন্টেশন কেবল ইংরেজিতে রক্ষণাবেক্ষণ করা হয়। অ্যাপ্লিকেশন UI বাংলায় `/bn`-এ পাওয়া যায়।

## আচরণবিধি

এই প্রকল্পটি একটি [আচরণবিধি](../../CODE_OF_CONDUCT.md) অনুসরণ করে। অংশগ্রহণ করে, আপনার কাছে এটি মেনে চলার প্রত্যাশা করা হয়।

## লাইসেন্স

MIT
