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
  🇻🇳 <strong>Tiếng Việt</strong> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center">Giao diện web cho <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Xem các luồng, duyệt bản ghi và chỉnh sửa cấu hình từ trình duyệt của bạn.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Bản demo MediaMTX Connect" width="720">
</p>

## Cách chạy

Image được phát hành cho cả `linux/amd64` và `linux/arm64` (Raspberry Pi, Apple Silicon, v.v.) — Docker tự động tải đúng bản.

Đã chạy MediaMTX rồi? Thêm Connect bên cạnh nó:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /duong-dan/den/ban-ghi:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` là nơi Connect truy cập API của MediaMTX từ *bên trong* container của nó. Giá trị mặc định là `http://mediamtx`, chỉ phân giải được trên mạng compose đi kèm — với lệnh `docker run` độc lập, hãy đặt nó thành host MediaMTX của bạn (bạn cũng có thể đổi sau trong **Config**).

Chưa có MediaMTX? Compose đi kèm khởi động cả hai:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Mở http://localhost:3000, vào **Config**, và trỏ nó đến MediaMTX của bạn.

> Connect cần `api: yes` trong `mediamtx.yml` của bạn. Xem [tệp đi kèm](../../mediamtx.yml) làm tham chiếu hoạt động.

### Cấu hình

Mọi thứ đều có thể cấu hình khi đang chạy trong **Config**. Các biến môi trường này chỉ dùng để khởi tạo lần chạy đầu tiên:

| Biến | Mặc định | Mục đích |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Host API của MediaMTX, truy cập được từ container của Connect |
| `MEDIAMTX_API_PORT` | `9997` | Cổng API của MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Đường dẫn trên host được gắn cho bản ghi (chỉ compose; tùy chọn — dùng mặc định nếu không đặt) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Nơi lưu các ảnh chụp màn hình được tạo |

## Tài liệu

[Kiến trúc](../../ARCHITECTURE.md) · [Tính năng](../../docs/FEATURES.md) · [Đóng góp](../../CONTRIBUTING.md)

> Lưu ý: tài liệu cho nhà phát triển chỉ được duy trì bằng tiếng Anh. Giao diện ứng dụng có sẵn bằng tiếng Việt tại `/vi`.

## Quy tắc ứng xử

Dự án này tuân theo một [Quy tắc ứng xử](../../CODE_OF_CONDUCT.md). Khi tham gia, bạn được kỳ vọng sẽ tuân thủ quy tắc này.

## Giấy phép

MIT
