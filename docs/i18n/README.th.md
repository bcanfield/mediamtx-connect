<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>เว็บ UI สำหรับ <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a></strong><br>
ดูสตรีมสด เปิดดูไฟล์บันทึก และแก้ค่าคอนฟิกได้ทุกคีย์ — จากเบราว์เซอร์ของคุณ</p>

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
  🇹🇭 <strong>ไทย</strong> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — ตารางสตรีมสด ตัวเปิดดูไฟล์บันทึก และตัวแก้ไขคอนฟิก" width="860">

</div>

## นี่คืออะไร

MediaMTX เป็นสตรีมมิงเซิร์ฟเวอร์ที่ยอดเยี่ยม และมันมาโดยไม่มีหน้าจอใช้งาน Connect คือส่วนหน้าที่ขาดหายไปนั้น: คอนเทนเนอร์เดียวที่คุยกับ API ของ MediaMTX แล้วเปลี่ยนมันให้เป็นกำแพงกล้อง คลังไฟล์บันทึก และตัวแก้ไขคอนฟิก

มันเป็นเพื่อนร่วมทาง ไม่ใช่ตัวแทน ทุกหน้าจอวางอยู่บนสิ่งที่ MediaMTX เปิดให้อยู่แล้ว — path หนึ่ง เอนด์พอยต์ API หนึ่ง ฮุก `runOn*` หนึ่ง หรือโปรโตคอลที่มันให้บริการเองอยู่แล้ว Connect ไม่เก็บวิดีโอ ไม่พร็อกซีสื่อ และไม่ใช้ฐานข้อมูล ชี้ไปที่เซิร์ฟเวอร์ที่กำลังทำงานอยู่ก็ใช้ได้เลย

## เริ่มใช้อย่างรวดเร็ว

อิมเมจถูกเผยแพร่ทั้งสำหรับ `linux/amd64` และ `linux/arm64` (Raspberry Pi, Apple Silicon และรุ่นใกล้เคียง) Docker จึงดึงตัวที่ถูกต้องให้เอง

**รัน MediaMTX อยู่แล้วใช่ไหม** วาง Connect ไว้ข้าง ๆ ได้เลย:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**เริ่มจากศูนย์ใช่ไหม** ไฟล์ compose ที่แถมมาจะยกทั้งสองตัวขึ้นให้:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

ไม่ว่าทางไหน ให้เปิด <http://localhost:3000>

> [!IMPORTANT]
> Connect ต้องการ `api: yes` ใน `mediamtx.yml` ของคุณ — การอ่านและเขียนทั้งหมดวิ่งผ่าน API ตัวนั้น [คอนฟิกที่แถมมา](../../mediamtx.yml) เป็นตัวอย่างที่ใช้งานได้จริง

## คุณจะได้อะไร

### มุมมองสด

ตารางแสดงทุก path ที่ MediaMTX รู้จัก เลือกได้ 2, 3 หรือ 4 คอลัมน์

- **เลือก WebRTC หรือ HLS ได้ทีละการ์ด** `AUTO` เลือก WebRTC ก่อนแล้วถอยไป HLS เงียบ ๆ `LOW-LAT` ยืนยันใช้ WebRTC ส่วน `COMPAT` บังคับ HLS แต่ละการ์ดต่อรองการเชื่อมต่อของตัวเองและรายงานวิธีขนส่งที่ได้มาจริง — ไม่ใช่ตัวที่คุณขอ
- **มีภาพนิ่งแม้ตอนไม่ได้เล่น** งานเบื้องหลังจะดึงเฟรมจากทุกสตรีม การ์ดที่ไม่ได้เล่นจึงยังเห็นภาพเหตุการณ์ พร้อมอายุของเฟรมบนป้าย ส่วน «ถ่ายภาพนิ่ง» จะดึงให้ทันที
- **ค่าวัดแบบสด** ป้ายโคเดก จำนวนผู้ชม และเวลาออนไลน์ มาจากรายการ path ตรง ๆ — ไม่มีคำขอเพิ่ม
- **สถานะการบันทึกที่บอกความจริง** การ์ดจะบอกว่าสตรีมกำลังบันทึก*จริง*หรือไม่ (ค่าทับของตัวมันเองรวมเข้ากับ path defaults ตามที่ MediaMTX ตีความ) และสถานะที่อ่านไม่ได้จะแสดงว่าไม่ทราบ แทนที่จะแสดงว่าปิด
- **คัดลอก URL สำหรับส่งสตรีม** ปลายทาง RTSP, RTMP และ SRT สร้างจากที่อยู่รับฟังของเซิร์ฟเวอร์เอง พอร์ตที่ถูกเปลี่ยนจึงยังเป็นพอร์ตที่ถูกต้อง

### ไฟล์บันทึก

- ไฟล์ MP4 ของแต่ละสตรีม จัดกลุ่มตามวัน ใหม่สุดก่อน พร้อมภาพย่อที่สร้างอัตโนมัติ
- ตัวเล่นที่กางออกในตำแหน่งเดิม พร้อมแถบเลื่อนของจริงที่ทำงานบนคำขอ HTTP Range
- ดาวน์โหลดแบบสตรีม พร้อมความคืบหน้าแบบสด ความเร็ว และปุ่มยกเลิก
- กด `/` ที่ไหนก็ได้เพื่อกรอง

### ตั้งค่าโดยไม่ต้องเขียน YAML

- **คอนฟิกเซิร์ฟเวอร์ทั้งชุด** — 65 ตัวควบคุมกระจายอยู่ใน Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC และ SRT ทุกตัวมีชนิดข้อมูล มีการตรวจสอบ และมีคำอธิบายในภาษาของคุณ
- **path defaults และค่าทับรายตัวของแต่ละ path** อยู่บนขอบเขตที่ MediaMTX ให้บริการจริง การบันทึกสตรีมที่ถูกครอบด้วยไวลด์การ์ดจะสร้างรายการแบบเบาบางขึ้นมา คีย์ที่ไม่ได้แตะจึงยังตามค่าเริ่มต้นต่อไป — และ «คืนค่าเป็นสืบทอด» จะย้อนกลับให้
- **ฮุก path `runOn*` ครบทั้ง 15 ตัว** พร้อมคำเตือนตรงจุดที่การบันทึกจะรีสตาร์ต path
- **เขียนแบบเบาบาง** Connect ส่ง PATCH เฉพาะคีย์ที่คุณแก้ ส่วนที่มันไม่ได้แสดงจะไม่ถูกแตะต้อง

### ทำมาเพื่อกล่องที่คุณลืมไปได้เลย

โปรเซสเดียวให้บริการทั้ง API, SPA และสื่อ · อิมเมจหลายสถาปัตยกรรม · `GET /health` · ล็อกแบบมีโครงสร้าง · PWA ที่ติดตั้งได้ · ธีมสว่างและมืด · 30 ภาษา · ไม่ต้องใช้ฐานข้อมูล

## ตัวแปรสภาพแวดล้อม

ทุกอย่างตรงนี้แก้ได้ระหว่างทำงานที่ **Config** — ตัวแปรเหล่านี้ใช้ตั้งค่าเริ่มต้นตอนบูตครั้งแรกเท่านั้น

| ตัวแปร | ค่าเริ่มต้น | ใช้ทำอะไร |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | จุดที่ Connect ติดต่อ API ของ MediaMTX จาก*ภายใน*คอนเทนเนอร์ของตัวเอง |
| `MEDIAMTX_API_PORT` | `9997` | พอร์ต API ของ MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | พาธบนโฮสต์ที่เมานต์ไว้สำหรับไฟล์บันทึก (เฉพาะ compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | ที่เก็บภาพย่อที่ถูกสร้างขึ้น |

ค่าเริ่มต้น `http://mediamtx` จะแปลงชื่อได้เฉพาะในเครือข่ายของ compose ที่แถมมา หากใช้ `docker run` เดี่ยว ๆ ให้ตั้งเป็นโฮสต์ MediaMTX ของคุณ — หรือแก้ทีหลังที่ **Config** โดยไม่ต้องรีสตาร์ต

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

การเล่นวิ่งจากเบราว์เซอร์ไปยัง MediaMTX โดยตรง Connect ขนแค่ JSON บวกกับไฟล์บันทึกและภาพย่อที่มันอ่านจากดิสก์

## เอกสาร

| | |
|---|---|
| [ความสามารถ](../FEATURES.md) | ทุกความสามารถ เส้นทาง และโพรซีเยอร์ที่ปล่อยแล้ว |
| [สถาปัตยกรรม](../../ARCHITECTURE.md) | ชิ้นส่วนต่าง ๆ ประกอบกันอย่างไร |
| [ร่วมพัฒนา](../../CONTRIBUTING.md) | การตั้งค่าเครื่องพัฒนา สคริปต์ และขั้นตอน PR |
| [ตัวอย่าง](../../examples/) | กล้อง Raspberry Pi และสตรีมจำลองสำหรับทดสอบ |

## ร่วมพัฒนา

ยินดีรับทั้ง issue และ PR คำสั่ง `pnpm install && pnpm dev` จะยกสแตกทั้งชุดพร้อมข้อมูลตัวอย่างให้ — อ่านรายละเอียดที่เหลือได้ใน [CONTRIBUTING.md](../../CONTRIBUTING.md) และโปรดทราบว่าหัวข้อ PR ใช้รูปแบบ [conventional commits](../../CONTRIBUTING.md) โครงการนี้ยึดถือ[หลักปฏิบัติของชุมชน](../../CODE_OF_CONDUCT.md)

## สัญญาอนุญาต

[MIT](../../LICENSE)
