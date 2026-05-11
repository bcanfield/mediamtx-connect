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
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect ডেমো" width="720">
</p>

## কীভাবে চালাবেন

ইতিমধ্যে MediaMTX চালাচ্ছেন? Connect-কে তার পাশে রাখুন:

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

এখনও MediaMTX নেই? সঙ্গে দেওয়া compose উভয়ই শুরু করে:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000 খুলুন, **Config**-এ যান, এবং এটিকে আপনার MediaMTX-এর দিকে নির্দেশ করুন।

> Connect-এর আপনার `mediamtx.yml`-এ `api: yes` প্রয়োজন। কর্মক্ষম রেফারেন্স হিসাবে [অন্তর্ভুক্ত ফাইল](../../mediamtx.yml) দেখুন।

## ডকুমেন্টেশন

[আর্কিটেকচার](../../ARCHITECTURE.md) · [বৈশিষ্ট্য](../../docs/FEATURES.md) · [অবদান](../../CONTRIBUTING.md)

> দ্রষ্টব্য: ডেভেলপার ডকুমেন্টেশন কেবল ইংরেজিতে রক্ষণাবেক্ষণ করা হয়। অ্যাপ্লিকেশন UI বাংলায় `/bn`-এ পাওয়া যায়।

## লাইসেন্স

MIT
