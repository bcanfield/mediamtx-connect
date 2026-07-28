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
  🇮🇳 <strong>हिन्दी</strong> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center"><a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a> के लिए वेब इंटरफ़ेस। अपने ब्राउज़र से स्ट्रीम देखें, रिकॉर्डिंग ब्राउज़ करें और कॉन्फ़िगरेशन संपादित करें।</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="MediaMTX Connect डेमो" width="720">
</p>

## कैसे चलाएँ

इमेज `linux/amd64` और `linux/arm64` (Raspberry Pi, Apple Silicon, आदि) दोनों के लिए प्रकाशित की जाती हैं — Docker स्वचालित रूप से सही वाली खींच लेता है।

क्या आप पहले से MediaMTX चला रहे हैं? Connect को उसके साथ जोड़ें:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` वह पता है जहाँ Connect अपने कंटेनर के *अंदर* से MediaMTX का API पाता है। इसका डिफ़ॉल्ट `http://mediamtx` है, जो केवल साथ दिए गए compose नेटवर्क पर ही हल होता है — स्वतंत्र `docker run` के लिए इसे अपने MediaMTX होस्ट पर सेट करें (आप इसे बाद में **Config** के अंतर्गत भी बदल सकते हैं)।

अभी तक MediaMTX नहीं है? साथ दिया गया compose दोनों को शुरू कर देता है:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

http://localhost:3000 खोलें, **Config** पर जाएँ, और इसे अपने MediaMTX की ओर इंगित करें।

> Connect को आपके `mediamtx.yml` में `api: yes` की आवश्यकता है। एक कार्यशील संदर्भ के लिए [शामिल फ़ाइल](../../mediamtx.yml) देखें।

### कॉन्फ़िगरेशन

सब कुछ **Config** के अंतर्गत रनटाइम पर कॉन्फ़िगर किया जा सकता है। ये env वेरिएबल केवल पहले बूट के लिए शुरुआती मान देते हैं:

| वेरिएबल | डिफ़ॉल्ट | उद्देश्य |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | MediaMTX API होस्ट, जो Connect के कंटेनर से पहुँच योग्य हो |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API पोर्ट |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | रिकॉर्डिंग के लिए माउंट किया गया होस्ट पथ (केवल compose; वैकल्पिक — सेट न होने पर डिफ़ॉल्ट लागू होता है) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | जहाँ बनाए गए स्क्रीनशॉट संग्रहीत होते हैं |

## दस्तावेज़ीकरण

[आर्किटेक्चर](../../ARCHITECTURE.md) · [विशेषताएँ](../../docs/FEATURES.md) · [योगदान](../../CONTRIBUTING.md)

> ध्यान दें: डेवलपर दस्तावेज़ केवल अंग्रेज़ी में ही रखे जाते हैं। एप्लिकेशन UI `/hi` पर हिन्दी में उपलब्ध है।

## आचार संहिता

यह प्रोजेक्ट एक [आचार संहिता](../../CODE_OF_CONDUCT.md) का पालन करता है। भाग लेकर, आपसे इसका पालन करने की अपेक्षा की जाती है।

## लाइसेंस

MIT
