<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> के लिए वेब UI।</strong><br>
लाइव स्ट्रीम देखें, रिकॉर्डिंग टटोलें, और अपना MediaMTX कॉन्फ़िग ब्राउज़र से ही बदलें।</p>

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

MediaMTX एक बेहतरीन स्ट्रीमिंग सर्वर है, पर बिना किसी UI के। Connect वही छूटा हुआ फ्रंट एंड है: एक कंटेनर जो MediaMTX के API से बात करता है और उसे कैमरा दीवार, रिकॉर्डिंग संग्रह और कॉन्फ़िग संपादक में बदल देता है।

यह साथी है, विकल्प नहीं। हर स्क्रीन किसी ऐसी चीज़ से जुड़ी है जो MediaMTX पहले से खोलकर रखता है: कोई path, कोई API एंडपॉइंट, कोई `runOn*` हुक, कोई प्रोटोकॉल जिसे वह खुद परोसता है। न वीडियो रखता है, न मीडिया प्रॉक्सी करता है, न कोई डेटाबेस।

## तेज़ शुरुआत

बहु-आर्किटेक्चर इमेज (`linux/amd64`, `linux/arm64`); Docker सही वाली खुद खींच लेता है।

**MediaMTX पहले से चल रहा है?** Connect को उसके बगल में रख दीजिए:

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

**शून्य से शुरू कर रहे हैं?** साथ आया compose Connect को बनाता है और MediaMTX के बगल में चलाता है:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

फिर <http://localhost:3000> खोलिए।

> [!IMPORTANT]
> Connect को आपकी `mediamtx.yml` में `api: yes` चाहिए। [साथ दिया गया कॉन्फ़िग](../../mediamtx.yml) जैसा है वैसा ही चलता है।

## आपको क्या मिलता है

### लाइव दृश्य

MediaMTX जिन-जिन path को जानता है, 2 से 4 कॉलम की ग्रिड में।

- **हर कार्ड के लिए अलग: WebRTC या HLS।** `AUTO` चुपचाप पीछे हट जाता है, `LOW-LAT` WebRTC पर अड़ा रहता है, और `COMPAT` HLS थोप देता है। हर कार्ड वही ट्रांसपोर्ट बताता है जो सचमुच मिला।
- **खाली बैठे भी स्नैपशॉट।** एक पृष्ठभूमि काम हर कार्ड पर हाल का फ़्रेम बनाए रखता है, और उसकी उम्र लेबल पर रहती है। अभी ताज़ा चाहिए? कार्ड के मेन्यू से ले लीजिए।
- **जीवंत टेलीमेट्री।** कोडेक, दर्शकों की संख्या और अपटाइम, सीधे path सूची से।
- **ईमानदार रिकॉर्डिंग स्थिति।** कार्ड बताते हैं कि स्ट्रीम *वास्तव में* रिकॉर्ड हो रही है या नहीं; जो स्थिति Connect पढ़ न सका वह अज्ञात कहलाती है, बंद कभी नहीं।
- **पब्लिश URL सीधे क्लिपबोर्ड में।** RTSP, RTMP और SRT, सर्वर के अपने लिसन पतों से बने। हर path का पेज इससे आगे जाता है, पब्लिश और रीड पैनल के साथ: सर्वर जो भी प्रोटोकॉल परोसता है, WHIP, WHEP, HLS और TLS वाले रूपों समेत, ffmpeg, GStreamer, OBS, ffplay और VLC के कॉपी करने लायक स्निपेट के साथ।

### रिकॉर्डिंग

- MediaMTX के प्लेबैक सर्वर से हर स्ट्रीम की एक दिन की टाइमलाइन: रिकॉर्ड हुए हिस्से और उनके बीच के खाली अंतराल, हर हिस्सा चलाने लायक। अगर प्लेबैक बंद है, तो Connect ठीक-ठीक बताता है कि कॉन्फ़िग में क्या बदलना होगा और एक क्लिक में लागू कर देता है।
- क्लिप डाउनलोड: एक घंटे तक की कोई भी अवधि (या पिछले 5 मिनट, 15 मिनट या एक घंटा) एक सादी MP4 के रूप में, जिसे MediaMTX बिना री-एन्कोडिंग के सेगमेंटों से जोड़ता है।
- हर स्ट्रीम के MP4 या MPEG-TS सेगमेंट, दिन के हिसाब से समूहित, अपने आप बने थंबनेल के साथ।
- पेज में ही खुलने वाला प्लेयर, जो वहीं फैल जाता है और HTTP range अनुरोधों से आगे-पीछे सरकता है।
- स्ट्रीम होते डाउनलोड, जीवंत प्रगति और रद्द करने के साथ।
- छाँटने के लिए `/` दबाइए।

### सेशन

- **जुड़े हुए सभी, एक ही तालिका में।** RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC और HLS पर पब्लिशर और रीडर, रिमोट पते, आने-जाने वाले बाइट और अपटाइम के साथ, हर 5 सेकंड में ताज़ा।
- **किसी क्लाइंट को निकालिए**, पुष्टि के बाद। वह दोबारा जुड़ सकता है; निकालना प्रतिबंध नहीं है।

### कॉन्फ़िगरेशन, बिना YAML

- **सर्वर कॉन्फ़िग:** Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC और SRT में फैले 66 टाइप वाले, जाँचे हुए नियंत्रण।
- **path defaults और हर path के अपने ओवरराइड**, उन्हीं दायरों पर जहाँ से MediaMTX उन्हें परोसता है। वाइल्डकार्ड से ढकी स्ट्रीम सहेजने पर एक विरल प्रविष्टि लिखी जाती है, इसलिए बिना छुई कुंजियाँ डिफ़ॉल्ट के साथ चलती रहती हैं।
- **path की एक सूची**, लाइव और regex बैज के साथ, "RTSP कैमरा जोड़ें" के लिए मार्गदर्शित फ़ॉर्म, और किसी भी path की अपनी प्रविष्टि को लौटाने या मिटाने का विकल्प (कोई जुड़ा हो तो चेतावनी के साथ)।
- **हर path के पेज पर जीवंत सेहत:** ट्रैक, रीडर, भेजे गए बाइट, त्रुटि वाले फ़्रेम और अपटाइम, हर 5 सेकंड में ताज़ा। जिस path पर कोई पब्लिश नहीं कर रहा वह निष्क्रिय दिखता है, खराब नहीं।
- **हर path पर लचीलापन:** हमेशा तैयार एक फ़ॉलबैक जो कैमरा बंद रहने तक ऑफ़लाइन क्लिप दोहराता रहता है, और ऑन-डिमांड खिंचाव जो स्रोत को सिर्फ़ तभी खोलता है जब कोई देख रहा हो।
- **हर `runOn*` हुक**, और जहाँ सहेजने से path दोबारा शुरू होता है वहाँ चेतावनी।
- **फ़ॉरवर्डिंग:** MediaMTX की अपनी `forward` सूची के ज़रिए किसी path को YouTube, Twitch या किसी दूसरे सर्वर पर धकेलिए, स्ट्रीम कुंजियाँ छिपी रहती हैं और path दोबारा शुरू नहीं होता।
- **विरल लेखन।** सिर्फ़ वही कुंजियाँ भेजी जाती हैं जो आपने बदलीं।

### संचालन

API, SPA और मीडिया के लिए एक ही प्रक्रिया · बहु-आर्किटेक्चर · `GET /api/health` · हेडर में MediaMTX संस्करण · संरचित लॉग · PWA के रूप में इंस्टॉल करने योग्य · गहरी और हल्की थीम · 30 भाषाएँ · कोई डेटाबेस नहीं।

## एनवायरनमेंट वेरिएबल

ये पहले बूट की नींव रखते हैं। सब कुछ **Config** में बदला जा सकता है।

| वेरिएबल | इमेज में डिफ़ॉल्ट | किसलिए |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect MediaMTX API तक कहाँ पहुँचता है |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API का पोर्ट |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | प्लेबैक के लिए *ब्राउज़र* MediaMTX तक कहाँ पहुँचता है। जब भी ब्राउज़र सर्वर पर न हो, इसे सेट कीजिए |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Connect रिकॉर्डिंग कहाँ से पढ़ता है |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | स्नैपशॉट और थंबनेल कहाँ जाते हैं |
| `DATA_DIR` | `/data` | `config.json` कहाँ रहती है |
| `PORT` | `3000` | HTTP पोर्ट |
| `LOG_LEVEL` | `info` | Pino का लॉग स्तर |

`http://mediamtx` सिर्फ़ साथ आए compose के नेटवर्क पर हल होता है। अलग से `docker run` कर रहे हों तो इसे अपने होस्ट पर सेट कीजिए। compose के साथ, `REMOTE_MEDIAMTX_URL` की जगह `.env` में `REMOTE_MEDIAMTX_HOST` सेट कीजिए: यह वह WebRTC होस्ट भी तय करता है जिसका MediaMTX विज्ञापन करता है। [`.env.example`](../../.env.example) हर एक को समझाता है, और `pnpm dev` बिना किसी `.env` के localhost डिफ़ॉल्ट इस्तेमाल करता है।

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

लाइव प्लेबैक ब्राउज़र से सीधे MediaMTX तक जाता है। Connect JSON ढोता है, और साथ में रिकॉर्डिंग व थंबनेल: डिस्क से, या MediaMTX के प्लेबैक सर्वर से प्रॉक्सी किए गए रिकॉर्ड हुए हिस्से।

## दस्तावेज़

| | |
|---|---|
| [विशेषताएँ](../../docs/FEATURES.md) | जारी हो चुकी हर क्षमता, रूट और प्रक्रिया |
| [आर्किटेक्चर](../../docs/ARCHITECTURE.md) | टुकड़े आपस में कैसे बैठते हैं |
| [योगदान](../../CONTRIBUTING.md) | डेव सेटअप, स्क्रिप्ट, PR प्रक्रिया |
| [उदाहरण](../../examples/) | Raspberry Pi कैमरा, परीक्षण के लिए नकली स्ट्रीम |

## योगदान

इशू और PR का स्वागत है। `pnpm install && pnpm dev` आपको फ़िक्स्चर समेत पूरा स्टैक दे देता है। [CONTRIBUTING.md](../../CONTRIBUTING.md) देखिए, और ध्यान रखिए कि PR के शीर्षक conventional commits होते हैं। हम एक [आचार संहिता](../../CODE_OF_CONDUCT.md) का पालन करते हैं।

## लाइसेंस

[MIT](../../LICENSE)
