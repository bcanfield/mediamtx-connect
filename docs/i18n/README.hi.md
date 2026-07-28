<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> के लिए वेब UI।</strong><br>
लाइव स्ट्रीम देखें, रिकॉर्डिंग टटोलें और कोई भी कॉन्फ़िग कुंजी बदलें — अपने ब्राउज़र से।</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — लाइव स्ट्रीम ग्रिड, रिकॉर्डिंग ब्राउज़र और कॉन्फ़िग संपादक" width="860">

</div>

## यह क्या है

MediaMTX एक बेहतरीन स्ट्रीमिंग सर्वर है, और वह बिना किसी इंटरफ़ेस के आता है। Connect वही छूटा हुआ फ्रंट-एंड है: एक कंटेनर जो MediaMTX के API से बात करता है और उसे कैमरा दीवार, रिकॉर्डिंग संग्रह और कॉन्फ़िग संपादक में बदल देता है।

यह साथी है, विकल्प नहीं। हर स्क्रीन उसी पर टिकी है जो MediaMTX पहले से खोलकर रखता है — कोई path, कोई API एंडपॉइंट, कोई `runOn*` हुक, कोई प्रोटोकॉल जिसे वह खुद परोसता है। Connect न वीडियो रखता है, न मीडिया प्रॉक्सी करता है, न कोई डेटाबेस पालता है। किसी चलते सर्वर की ओर इशारा कीजिए, बस काम हो गया।

## तेज़ शुरुआत

इमेज `linux/amd64` और `linux/arm64` दोनों के लिए प्रकाशित होती हैं (Raspberry Pi, Apple Silicon वगैरह), इसलिए Docker सही वाली खुद खींच लेता है।

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

दोनों में से जो भी हो, <http://localhost:3000> खोलिए।

> [!IMPORTANT]
> Connect को आपकी `mediamtx.yml` में `api: yes` चाहिए — पढ़ना-लिखना सब उसी API से होकर गुज़रता है। [साथ दी गई कॉन्फ़िगरेशन](../../mediamtx.yml) एक चलता-फिरता नमूना है।

## आपको क्या मिलता है

### लाइव दृश्य

MediaMTX जिन-जिन path को जानता है उन सबकी ग्रिड — 2, 3 या 4 कॉलम में।

- **हर कार्ड के लिए अलग: WebRTC या HLS।** `AUTO` WebRTC को तरजीह देता है और चुपचाप HLS पर उतर आता है, `LOW-LAT` WebRTC पर अड़ा रहता है, और `COMPAT` HLS थोप देता है। हर कार्ड अपना कनेक्शन खुद तय करता है और वही ट्रांसपोर्ट बताता है जो सचमुच मिला — वह नहीं जो आपने माँगा था।
- **खाली बैठे भी स्नैपशॉट।** एक पृष्ठभूमि काम हर स्ट्रीम से एक फ़्रेम उठा लेता है, इसलिए बंद पड़े कार्ड भी दृश्य दिखाते रहते हैं, और फ़्रेम की उम्र लेबल पर लिखी रहती है। «स्नैपशॉट लें» तुरंत एक खींच देता है।
- **जीवंत टेलीमेट्री।** कोडेक चिप, दर्शकों की संख्या और ऑनलाइन समय — सीधे path सूची से, बिना किसी अतिरिक्त अनुरोध के।
- **रिकॉर्डिंग की सच्ची स्थिति।** कार्ड बताते हैं कि स्ट्रीम *वास्तव में* रिकॉर्ड हो रही है या नहीं (उसका अपना ओवरराइड path defaults के ऊपर मिलाकर, ठीक वैसे जैसे MediaMTX इसे सुलझाता है); जो स्थिति पढ़ी न जा सकी वह बंद के बजाय अज्ञात दिखती है।
- **पब्लिश URL सीधे क्लिपबोर्ड में।** RTSP, RTMP और SRT पते सर्वर के अपने लिसन पतों से बनते हैं, इसलिए बदला हुआ पोर्ट भी सही पोर्ट ही रहता है।

### रिकॉर्डिंग

- हर स्ट्रीम की MP4 फ़ाइलें, दिन के हिसाब से समूहित, नई पहले, अपने आप बने थंबनेल के साथ।
- वहीं खुल जाने वाला प्लेयर, और HTTP Range अनुरोधों पर टिकी असली सीक बार।
- स्ट्रीम होते डाउनलोड — जीवंत प्रगति, गति और रद्द करने का बटन।
- छाँटने के लिए कहीं भी `/` दबाइए।

### कॉन्फ़िगरेशन, बिना YAML

- **पूरा सर्वर कॉन्फ़िगरेशन** — Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC और SRT में फैले 65 नियंत्रण, हर एक टाइप वाला, जाँचा हुआ और आपकी भाषा में समझाया हुआ।
- **path defaults और हर path के अपने ओवरराइड**, ठीक उन्हीं दायरों पर जहाँ से MediaMTX उन्हें सचमुच परोसता है। वाइल्डकार्ड से ढकी स्ट्रीम सहेजने पर एक विरल प्रविष्टि बन जाती है, इसलिए बिना छुई कुंजियाँ डिफ़ॉल्ट का पीछा करती रहती हैं — और «विरासत पर लौटें» इसे पलट देता है।
- **सभी 15 `runOn*` path हुक**, और जहाँ सहेजने से path दोबारा शुरू होता है वहाँ चेतावनी।
- **विरल लेखन।** Connect सिर्फ़ बदली हुई कुंजियों का PATCH भेजता है; जो वह दिखाता ही नहीं, उसे छूता भी नहीं।

### ऐसे डिब्बे के लिए जिसे आप भूल जाएँ

एक ही प्रक्रिया API, SPA और मीडिया परोसती है · बहु-आर्किटेक्चर इमेज · `GET /health` · संरचित लॉग · इंस्टॉल होने वाला PWA · हल्की और गहरी थीम · 30 भाषाएँ · कोई डेटाबेस नहीं।

## एनवायरनमेंट वेरिएबल

यह सब **Config** में चलते-चलते बदला जा सकता है — ये वेरिएबल सिर्फ़ पहले बूट की नींव रखते हैं।

| वेरिएबल | डिफ़ॉल्ट | किसलिए |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect अपने कंटेनर के *भीतर* से MediaMTX API तक कहाँ पहुँचता है |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API का पोर्ट |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | रिकॉर्डिंग के लिए माउंट किया गया होस्ट पथ (सिर्फ़ compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | बने हुए थंबनेल कहाँ रखे जाते हैं |

डिफ़ॉल्ट `http://mediamtx` सिर्फ़ साथ आए compose के नेटवर्क पर ही हल होता है। अलग से `docker run` कर रहे हों तो इसे अपने MediaMTX होस्ट पर सेट कीजिए — या बाद में **Config** में ठीक कर लीजिए, रीस्टार्ट की ज़रूरत नहीं।

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

प्लेबैक ब्राउज़र से सीधे MediaMTX तक जाता है। Connect सिर्फ़ JSON ढोता है, और उसके साथ डिस्क से पढ़ी गई रिकॉर्डिंग व थंबनेल।

## दस्तावेज़

| | |
|---|---|
| [विशेषताएँ](../FEATURES.md) | जारी हो चुकी हर क्षमता, रूट और प्रक्रिया |
| [आर्किटेक्चर](../../ARCHITECTURE.md) | टुकड़े आपस में कैसे बैठते हैं |
| [योगदान](../../CONTRIBUTING.md) | डेव सेटअप, स्क्रिप्ट, PR प्रक्रिया |
| [उदाहरण](../../examples/) | Raspberry Pi कैमरा, परीक्षण के लिए नकली स्ट्रीम |

## योगदान

इशू और PR का स्वागत है। `pnpm install && pnpm dev` आपको नमूना डेटा समेत पूरा स्टैक दे देता है — बाकी के लिए [CONTRIBUTING.md](../../CONTRIBUTING.md) देखिए, और ध्यान रहे कि PR के शीर्षक [conventional commits](../../CONTRIBUTING.md) होते हैं। यह परियोजना एक [आचार संहिता](../../CODE_OF_CONDUCT.md) का पालन करती है।

## लाइसेंस

[MIT](../../LICENSE)
