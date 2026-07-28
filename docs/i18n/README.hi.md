<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> के लिए वेब UI।</strong><br>
लाइव स्ट्रीम देखें, रिकॉर्डिंग टटोलें, कोई भी कॉन्फ़िग कुंजी बदलें — अपने ब्राउज़र से।</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — लाइव स्ट्रीम ग्रिड, रिकॉर्डिंग ब्राउज़र और कॉन्फ़िग संपादक" width="860">

<details>
<summary>🌍 30 भाषाओं में पढ़ें</summary>
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
  🇮🇳 <strong>हिन्दी</strong> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## यह क्या है

MediaMTX एक बेहतरीन स्ट्रीमिंग सर्वर है, पर बिना किसी इंटरफ़ेस के। Connect वही छूटा हुआ फ्रंट-एंड है: एक कंटेनर जो MediaMTX के API से बात करता है और उसे कैमरा दीवार, रिकॉर्डिंग संग्रह और कॉन्फ़िग संपादक में बदल देता है।

यह साथी है, विकल्प नहीं। हर स्क्रीन उसी पर टिकी है जो MediaMTX पहले से खोलकर रखता है: कोई path, कोई API एंडपॉइंट, कोई `runOn*` हुक, कोई प्रोटोकॉल जिसे वह खुद परोसता है। न वीडियो रखता है, न मीडिया प्रॉक्सी करता है, न कोई डेटाबेस।

## तेज़ शुरुआत

बहु-आर्किटेक्चर इमेज (`linux/amd64`, `linux/arm64`) — Docker सही वाली खुद खींच लेता है।

**MediaMTX पहले से चल रहा है?** Connect को उसके बगल में रख दीजिए:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**शून्य से शुरू कर रहे हैं?** साथ आया compose दोनों खड़े कर देता है:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

फिर <http://localhost:3000> खोलिए।

> [!IMPORTANT]
> Connect को आपकी `mediamtx.yml` में `api: yes` चाहिए। [साथ दी गई कॉन्फ़िगरेशन](../../mediamtx.yml) जैसी है वैसी ही चलती है।

## आपको क्या मिलता है

### लाइव दृश्य

MediaMTX जिन-जिन path को जानता है, 2 से 4 कॉलम की ग्रिड में।

- **हर कार्ड के लिए अलग: WebRTC या HLS।** `AUTO` चुपचाप HLS पर उतर आता है, `LOW-LAT` WebRTC पर अड़ा रहता है, और `COMPAT` HLS थोप देता है — और हर कार्ड वही ट्रांसपोर्ट बताता है जो सचमुच मिला।
- **खाली बैठे भी स्नैपशॉट।** एक पृष्ठभूमि काम हर कार्ड पर ताज़ा फ़्रेम बनाए रखता है, और उसकी उम्र लेबल पर रहती है।
- **जीवंत टेलीमेट्री।** कोडेक, दर्शकों की संख्या और ऑनलाइन समय — सीधे path सूची से।
- **ईमानदार रिकॉर्डिंग स्थिति।** कार्ड बताते हैं कि स्ट्रीम *वास्तव में* रिकॉर्ड हो रही है या नहीं; जो स्थिति Connect पढ़ न सका वह अज्ञात कहलाती है, बंद कभी नहीं।
- **पब्लिश URL सीधे क्लिपबोर्ड में।** RTSP, RTMP और SRT, सर्वर के अपने लिसन पतों से बने।

### रिकॉर्डिंग

- हर स्ट्रीम की MP4 फ़ाइलें, दिन के हिसाब से समूहित, अपने आप बने थंबनेल के साथ।
- वहीं खुल जाने वाला प्लेयर, HTTP Range अनुरोधों से आगे-पीछे सरकने वाला।
- स्ट्रीम होते डाउनलोड, जीवंत प्रगति और रद्द करने के साथ।
- छाँटने के लिए `/` दबाइए।

### कॉन्फ़िगरेशन, बिना YAML

- **पूरा सर्वर कॉन्फ़िगरेशन** — Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC और SRT में फैले 65 टाइप वाले, जाँचे हुए नियंत्रण।
- **path defaults और हर path के अपने ओवरराइड**, उन्हीं दायरों पर जहाँ से MediaMTX उन्हें परोसता है। वाइल्डकार्ड से ढकी स्ट्रीम सहेजने पर एक विरल प्रविष्टि लिखी जाती है, इसलिए बिना छुई कुंजियाँ विरासत में मिलती रहती हैं।
- **सभी 15 `runOn*` हुक**, और जहाँ सहेजने से path दोबारा शुरू होता है वहाँ चेतावनी।
- **विरल लेखन** — सिर्फ़ वही कुंजियाँ जो आपने बदलीं।

### संचालन

API, SPA और मीडिया के लिए एक ही प्रक्रिया · बहु-आर्किटेक्चर · `GET /health` · संरचित लॉग · PWA · हल्की और गहरी · 30 भाषाएँ · कोई डेटाबेस नहीं।

## एनवायरनमेंट वेरिएबल

ये सिर्फ़ पहले बूट की नींव रखते हैं। बाकी सब **Config** में बदला जा सकता है।

| वेरिएबल | डिफ़ॉल्ट | किसलिए |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect अपने कंटेनर के भीतर से MediaMTX API तक कहाँ पहुँचता है |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API का पोर्ट |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | रिकॉर्डिंग के लिए माउंट किया गया होस्ट पथ (सिर्फ़ compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | थंबनेल कहाँ रखे जाते हैं |

`http://mediamtx` सिर्फ़ साथ आए compose के नेटवर्क पर हल होता है — अलग से `docker run` कर रहे हों तो इसे अपने होस्ट पर सेट कीजिए।

## यह काम कैसे करता है

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

प्लेबैक ब्राउज़र से MediaMTX तक जाता है। Connect सिर्फ़ JSON ढोता है, और उसके साथ डिस्क से पढ़ी गई रिकॉर्डिंग व थंबनेल।

## दस्तावेज़

| | |
|---|---|
| [विशेषताएँ](../FEATURES.md) | जारी हो चुकी हर क्षमता, रूट और प्रक्रिया |
| [आर्किटेक्चर](../../ARCHITECTURE.md) | टुकड़े आपस में कैसे बैठते हैं |
| [योगदान](../../CONTRIBUTING.md) | डेव सेटअप, स्क्रिप्ट, PR प्रक्रिया |
| [उदाहरण](../../examples/) | Raspberry Pi कैमरा, परीक्षण के लिए नकली स्ट्रीम |

## योगदान

इशू और PR का स्वागत है। `pnpm install && pnpm dev` आपको नमूना डेटा समेत पूरा स्टैक दे देता है — बाकी के लिए [CONTRIBUTING.md](../../CONTRIBUTING.md) देखिए, और PR के शीर्षक conventional commits होते हैं। हम एक [आचार संहिता](../../CODE_OF_CONDUCT.md) का पालन करते हैं।

## लाइसेंस

[MIT](../../LICENSE)
