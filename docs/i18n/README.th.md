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
  🇹🇭 <strong>ไทย</strong> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center">เว็บอินเทอร์เฟซสำหรับ <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a> ดูสตรีม เรียกดูการบันทึก และแก้ไขการตั้งค่าจากเบราว์เซอร์ของคุณ</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="เดโม MediaMTX Connect" width="720">
</p>

## วิธีรัน

กำลังรัน MediaMTX อยู่แล้วใช่ไหม วาง Connect ไว้ข้าง ๆ:

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

ยังไม่มี MediaMTX? compose ที่มาด้วยจะเริ่มทั้งสองพร้อมกัน:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

เปิด http://localhost:3000 ไปที่ **Config** และชี้ไปยัง MediaMTX ของคุณ

> Connect ต้องการ `api: yes` ใน `mediamtx.yml` ของคุณ ดู [ไฟล์ที่มาด้วย](../../mediamtx.yml) เป็นข้อมูลอ้างอิงที่ใช้งานได้

## เอกสาร

[สถาปัตยกรรม](../../ARCHITECTURE.md) · [ฟีเจอร์](../../docs/FEATURES.md) · [การมีส่วนร่วม](../../CONTRIBUTING.md)

> หมายเหตุ: เอกสารสำหรับนักพัฒนาจะดูแลเป็นภาษาอังกฤษเท่านั้น UI ของแอปพลิเคชันมีให้บริการเป็นภาษาไทยที่ `/th`

## ใบอนุญาต

MIT
