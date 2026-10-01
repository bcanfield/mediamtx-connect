<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>เว็บ UI สำหรับ <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a></strong><br>
ดูสตรีมสด เปิดดูไฟล์บันทึก และแก้คอนฟิก MediaMTX ของคุณได้จากเบราว์เซอร์</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — ตารางสตรีมสด ตัวเปิดดูไฟล์บันทึก และตัวแก้ไขคอนฟิก" width="860">

<details>
<summary>🌍 อ่านใน 30 ภาษา</summary>
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
  🇹🇭 <strong>ไทย</strong> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## นี่คืออะไร

MediaMTX เป็นสตรีมมิงเซิร์ฟเวอร์ที่ยอดเยี่ยมแต่ไม่มี UI Connect คือส่วนหน้าที่ขาดหายไปนั้น: คอนเทนเนอร์เดียวที่คุยกับ API ของ MediaMTX แล้วเปลี่ยนมันให้เป็นกำแพงกล้อง คลังไฟล์บันทึก และตัวแก้ไขคอนฟิก

มันเป็นเพื่อนร่วมทาง ไม่ใช่ตัวแทน ทุกหน้าจอสอดคล้องกับสิ่งที่ MediaMTX เปิดให้อยู่แล้ว: path หนึ่ง เอนด์พอยต์ API หนึ่ง ฮุก `runOn*` หนึ่ง หรือโปรโตคอลที่มันให้บริการเอง ไม่เก็บวิดีโอ ไม่พร็อกซีสื่อ ไม่ใช้ฐานข้อมูล

## เริ่มใช้อย่างรวดเร็ว

อิมเมจหลายสถาปัตยกรรม (`linux/amd64`, `linux/arm64`) Docker จะดึงตัวที่ถูกต้องให้เอง

**รัน MediaMTX อยู่แล้วใช่ไหม** วาง Connect ไว้ข้าง ๆ ได้เลย:

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

**เริ่มจากศูนย์ใช่ไหม** ไฟล์ compose ที่แถมมาจะบิลด์ Connect แล้วรันไว้คู่กับ MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

จากนั้นเปิด <http://localhost:3000>

> [!IMPORTANT]
> Connect ต้องการ `api: yes` ใน `mediamtx.yml` ของคุณ [คอนฟิกที่แถมมา](../../mediamtx.yml) ใช้ได้ทันที

## คุณจะได้อะไร

### มุมมองสด

ทุก path ที่ MediaMTX รู้จัก ในตาราง 2 ถึง 4 คอลัมน์

- **เลือก WebRTC หรือ HLS ได้ทีละการ์ด** `AUTO` ถอยไป HLS เงียบ ๆ `LOW-LAT` ยืนยันใช้ WebRTC ส่วน `COMPAT` บังคับ HLS แต่ละการ์ดรายงานวิธีขนส่งที่ได้มาจริง
- **มีภาพนิ่งแม้ตอนไม่ได้เล่น** งานเบื้องหลังเก็บเฟรมล่าสุดไว้บนทุกการ์ด พร้อมอายุของเฟรมบนป้าย อยากได้ภาพใหม่ตอนนี้เลยใช่ไหม ถ่ายได้จากเมนูของการ์ด
- **ค่าวัดแบบสด** โคเดก จำนวนผู้ชม และเวลาออนไลน์ มาจากรายการ path ตรง ๆ
- **สถานะการบันทึกที่ตรงไปตรงมา** การ์ดบอกว่าสตรีมกำลังบันทึก*จริง*หรือไม่ ส่วนสถานะที่ Connect อ่านไม่ได้จะแสดงว่าไม่ทราบ ไม่ใช่ปิด
- **คัดลอก URL สำหรับส่งสตรีม** RTSP, RTMP และ SRT สร้างจากที่อยู่รับฟังของเซิร์ฟเวอร์เอง หน้าของแต่ละ path ยังมีมากกว่านั้นด้วยแผงสำหรับส่งและอ่านสตรีม: ทุกโปรโตคอลที่เซิร์ฟเวอร์ให้บริการ รวมถึง WHIP, WHEP, HLS และรุ่นที่ใช้ TLS พร้อมตัวอย่างคำสั่งสำหรับ ffmpeg, GStreamer, OBS, ffplay และ VLC ที่คัดลอกไปใช้ได้ทันที

### ไฟล์บันทึก

- ไทม์ไลน์รายวันของแต่ละสตรีมจากเซิร์ฟเวอร์เล่นย้อนหลังของ MediaMTX: ช่วงที่บันทึกไว้และช่องว่างระหว่างช่วงเหล่านั้น เล่นได้ทุกช่วง หากปิดการเล่นย้อนหลังไว้ Connect จะแสดงการเปลี่ยนแปลงคอนฟิกที่ต้องใช้อย่างแม่นยำ และนำไปใช้ได้ในคลิกเดียว
- ดาวน์โหลดคลิป: ช่วงใดก็ได้ยาวสูงสุดหนึ่งชั่วโมง (หรือ 5 นาที 15 นาที หรือหนึ่งชั่วโมงล่าสุด) เป็นไฟล์ MP4 ธรรมดาไฟล์เดียว MediaMTX ต่อจากหลายเซกเมนต์ให้โดยไม่ต้องเข้ารหัสใหม่
- เซกเมนต์ MP4 หรือ MPEG-TS ของแต่ละสตรีม จัดกลุ่มตามวัน พร้อมภาพย่ออัตโนมัติ
- ตัวเล่นในหน้าที่กางออกในตำแหน่งเดิม เลื่อนหาตำแหน่งได้ผ่านคำขอ HTTP range
- ดาวน์โหลดแบบสตรีม พร้อมความคืบหน้าแบบสดและปุ่มยกเลิก
- กด `/` เพื่อกรอง

### เซสชัน

- **ทุกคนที่เชื่อมต่ออยู่ในตารางเดียว** ผู้ส่งและผู้อ่านผ่าน RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC และ HLS พร้อมที่อยู่ปลายทาง จำนวนไบต์เข้าและออก และเวลาออนไลน์ รีเฟรชทุก 5 วินาที
- **เตะไคลเอนต์ออก** หลังยืนยัน ไคลเอนต์เชื่อมต่อใหม่ได้ การเตะออกไม่ใช่การแบน

### ตั้งค่าโดยไม่ต้องเขียน YAML

- **คอนฟิกเซิร์ฟเวอร์:** 66 ตัวควบคุมที่มีชนิดข้อมูลและผ่านการตรวจสอบ ใน Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC และ SRT
- **path defaults และค่าทับของแต่ละ path** อยู่บนขอบเขตที่ MediaMTX ให้บริการจริง การบันทึกสตรีมที่ถูกครอบด้วยไวลด์การ์ดจะเขียนรายการแบบเบาบาง คีย์ที่ไม่ได้แตะจึงยังตามค่าเริ่มต้นต่อไป
- **แค็ตตาล็อก path** พร้อมป้ายสถานะสดและ regex ฟอร์มแบบมีขั้นตอนสำหรับ "เพิ่มกล้อง RTSP" และปุ่มย้อนกลับหรือลบรายการของ path ใดก็ได้ (พร้อมคำเตือนหากมีคนเชื่อมต่ออยู่)
- **สถานะสุขภาพแบบสดในหน้าของแต่ละ path:** แทร็ก ผู้อ่าน จำนวนไบต์ที่ส่งผ่าน เฟรมที่ผิดพลาด และเวลาออนไลน์ รีเฟรชทุก 5 วินาที path ที่ไม่มีใครส่งสตรีมจะแสดงว่าว่าง ไม่ใช่เสีย
- **ความทนทานในแต่ละ path:** ตัวสำรองที่พร้อมเสมอซึ่งวนเล่นคลิปออฟไลน์ระหว่างที่กล้องดับ และการดึงสัญญาณตามต้องการที่จะเปิดต้นทางเฉพาะตอนมีคนดู
- **ฮุก `runOn*` ทุกตัว** พร้อมคำเตือนตรงจุดที่การบันทึกจะรีสตาร์ต path
- **การส่งต่อ:** ส่ง path ไปยัง YouTube, Twitch หรือเซิร์ฟเวอร์อื่นผ่านรายการ `forward` ดั้งเดิมของ MediaMTX โดยซ่อนสตรีมคีย์และไม่ต้องรีสตาร์ต path
- **เขียนแบบเบาบาง** ส่งไปเฉพาะคีย์ที่คุณแก้

### การดูแลระบบ

โปรเซสเดียวสำหรับ API, SPA และสื่อ · หลายสถาปัตยกรรม · `GET /api/health` · เวอร์ชัน MediaMTX บนส่วนหัว · ล็อกแบบมีโครงสร้าง · ติดตั้งเป็น PWA ได้ · มืดและสว่าง · 30 ภาษา · ไม่ต้องใช้ฐานข้อมูล

## ตัวแปรสภาพแวดล้อม

ใช้ตั้งค่าเริ่มต้นตอนบูตครั้งแรก ทุกอย่างยังแก้ได้ที่ **Config**

| ตัวแปร | ค่าเริ่มต้นในอิมเมจ | ใช้ทำอะไร |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | จุดที่ Connect ติดต่อ API ของ MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | พอร์ต API ของ MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | จุดที่*เบราว์เซอร์*ติดต่อ MediaMTX เพื่อเล่นวิดีโอ ตั้งค่านี้ทุกครั้งที่เบราว์เซอร์ไม่ได้อยู่บนเซิร์ฟเวอร์ |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | ที่ที่ Connect อ่านไฟล์บันทึก |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | ที่เก็บภาพนิ่งและภาพย่อ |
| `DATA_DIR` | `/data` | ที่อยู่ของ `config.json` |
| `PORT` | `3000` | พอร์ต HTTP |
| `LOG_LEVEL` | `info` | ระดับล็อกของ Pino |

`http://mediamtx` แปลงชื่อได้เฉพาะในเครือข่ายของ compose ที่แถมมา หากใช้ `docker run` เดี่ยว ๆ ให้ชี้ไปที่โฮสต์ของคุณ เมื่อใช้ compose ให้ตั้ง `REMOTE_MEDIAMTX_HOST` ใน `.env` แทน `REMOTE_MEDIAMTX_URL` เพราะค่านี้ยังกำหนดโฮสต์ WebRTC ที่ MediaMTX ประกาศออกไปด้วย [`.env.example`](../../.env.example) อธิบายตัวแปรแต่ละตัวไว้ และ `pnpm dev` ใช้ค่าเริ่มต้นแบบ localhost โดยไม่ต้องมี `.env` เลย

## ทำงานอย่างไร

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

การเล่นสดวิ่งจากเบราว์เซอร์ไปยัง MediaMTX โดยตรง Connect ขน JSON บวกกับไฟล์บันทึกและภาพย่อ: จากดิสก์ หรือช่วงที่บันทึกไว้ซึ่งพร็อกซีมาจากเซิร์ฟเวอร์เล่นย้อนหลังของ MediaMTX

## เอกสาร

| | |
|---|---|
| [ความสามารถ](../../docs/FEATURES.md) | ทุกความสามารถ เส้นทาง และโพรซีเยอร์ที่ปล่อยแล้ว |
| [สถาปัตยกรรม](../../docs/ARCHITECTURE.md) | ชิ้นส่วนต่าง ๆ ประกอบกันอย่างไร |
| [ร่วมพัฒนา](../../CONTRIBUTING.md) | การตั้งค่าเครื่องพัฒนา สคริปต์ และขั้นตอน PR |
| [ตัวอย่าง](../../examples/) | กล้อง Raspberry Pi และสตรีมจำลองสำหรับทดสอบ |

## ร่วมพัฒนา

ยินดีรับทั้ง issue และ PR คำสั่ง `pnpm install && pnpm dev` จะยกสแตกทั้งชุดพร้อมข้อมูลทดสอบให้ อ่านเพิ่มเติมได้ใน [CONTRIBUTING.md](../../CONTRIBUTING.md) และโปรดทราบว่าหัวข้อ PR ใช้รูปแบบ conventional commits เรายึดถือ[หลักปฏิบัติของชุมชน](../../CODE_OF_CONDUCT.md)

## สัญญาอนุญาต

[MIT](../../LICENSE)
