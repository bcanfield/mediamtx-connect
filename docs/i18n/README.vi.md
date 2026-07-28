<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Giao diện web cho <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Xem luồng trực tiếp, duyệt bản ghi và sửa mọi khóa cấu hình — ngay trong trình duyệt.</p>

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
  🇻🇳 <strong>Tiếng Việt</strong> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — lưới luồng trực tiếp, trình duyệt bản ghi và trình sửa cấu hình" width="860">

</div>

## Đây là gì

MediaMTX là một máy chủ phát trực tuyến xuất sắc, và nó không đi kèm giao diện. Connect chính là phần front-end còn thiếu: một container nói chuyện với API của MediaMTX và biến nó thành bức tường camera, kho lưu bản ghi và trình sửa cấu hình.

Đây là bạn đồng hành, không phải bản thay thế. Mọi màn hình đều dựa trên thứ MediaMTX vốn đã phơi ra — một path, một endpoint API, một hook `runOn*`, một giao thức nó phục vụ sẵn. Connect không lưu video, không làm proxy media và không dùng cơ sở dữ liệu. Trỏ nó vào một máy chủ đang chạy là dùng được.

## Bắt đầu nhanh

Image được phát hành cho `linux/amd64` và `linux/arm64` (Raspberry Pi, Apple Silicon và họ hàng), nên Docker sẽ tải đúng bản cho bạn.

**Đã chạy MediaMTX rồi?** Đặt Connect bên cạnh nó:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Bắt đầu từ con số không?** File compose đi kèm dựng cả hai:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Dù theo cách nào, hãy mở <http://localhost:3000>.

> [!IMPORTANT]
> Connect cần `api: yes` trong `mediamtx.yml` của bạn — mọi thao tác đọc và ghi đều đi qua API đó. [Cấu hình đi kèm](../../mediamtx.yml) là một mẫu chạy được.

## Bạn nhận được gì

### Xem trực tiếp

Một lưới chứa mọi path mà MediaMTX biết, ở 2, 3 hoặc 4 cột.

- **WebRTC hay HLS, tùy từng thẻ.** `AUTO` ưu tiên WebRTC và lặng lẽ rơi về HLS, `LOW-LAT` nhất quyết dùng WebRTC, còn `COMPAT` ép dùng HLS. Mỗi thẻ tự thương lượng kết nối riêng và báo đúng phương thức truyền tải nó thực sự có được — chứ không phải cái bạn yêu cầu.
- **Ảnh chụp ngay cả khi rảnh.** Một tác vụ nền lấy một khung hình từ mỗi luồng, nên những thẻ không phát vẫn cho thấy khung cảnh, kèm tuổi của khung hình trên nhãn. «Chụp ảnh» lấy ngay một tấm.
- **Đo lường trực tiếp.** Nhãn codec, số người xem và thời gian trực tuyến, lấy thẳng từ danh sách path — không thêm request nào.
- **Trạng thái ghi nói đúng sự thật.** Thẻ cho biết luồng có đang ghi *trên thực tế* hay không (phần ghi đè của chính nó hợp lên trên path defaults, đúng cách MediaMTX phân giải); trạng thái không đọc được sẽ hiện là chưa rõ chứ không phải tắt.
- **URL phát lên vào clipboard.** Các đích RTSP, RTMP và SRT được dựng từ chính địa chỉ lắng nghe của máy chủ, nên cổng đã đổi vẫn là cổng đúng.

### Bản ghi

- Các file MP4 của từng luồng, gom theo ngày, mới nhất lên trước, kèm ảnh thu nhỏ tạo tự động.
- Trình phát bung ra ngay tại chỗ, với thanh tua thật dựa trên request HTTP Range.
- Tải xuống theo luồng với tiến độ trực tiếp, tốc độ và nút hủy.
- Nhấn `/` ở bất kỳ đâu để lọc.

### Cấu hình, không cần YAML

- **Toàn bộ cấu hình máy chủ** — 65 điều khiển trải khắp Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC và SRT, mỗi cái đều có kiểu, được kiểm tra và có mô tả bằng ngôn ngữ của bạn.
- **Path defaults và ghi đè theo từng path**, trên đúng phạm vi mà MediaMTX thực sự phục vụ chúng. Lưu một luồng đang nằm dưới ký tự đại diện sẽ tạo ra một mục thưa, nên những khóa bạn không đụng tới vẫn bám theo giá trị mặc định — và «trở về kế thừa» sẽ hoàn tác.
- **Đủ cả 15 hook path `runOn*`**, kèm cảnh báo ở nơi việc lưu sẽ khởi động lại path.
- **Ghi thưa.** Connect chỉ PATCH những khóa bạn đã đổi; thứ nó không phơi ra thì để nguyên.

### Làm cho một chiếc hộp mà bạn quên mất

Một tiến trình duy nhất phục vụ API, SPA và media · image đa kiến trúc · `GET /health` · log có cấu trúc · PWA cài được · giao diện sáng và tối · 30 ngôn ngữ · không cần cơ sở dữ liệu.

## Biến môi trường

Mọi thứ ở đây đều sửa được lúc đang chạy trong **Config** — các biến này chỉ gieo giá trị cho lần khởi động đầu tiên.

| Biến | Mặc định | Mục đích |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Nơi Connect với tới API của MediaMTX từ *bên trong* container của nó |
| `MEDIAMTX_API_PORT` | `9997` | Cổng API của MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Đường dẫn trên host được gắn cho bản ghi (chỉ với compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Nơi lưu ảnh thu nhỏ được tạo ra |

Giá trị mặc định `http://mediamtx` chỉ phân giải được trong mạng của file compose đi kèm. Với `docker run` độc lập, hãy đặt nó thành host MediaMTX của bạn — hoặc sửa sau trong **Config**, không cần khởi động lại.

## Cách hoạt động

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

Việc phát đi thẳng từ trình duyệt tới MediaMTX. Connect chỉ chuyển JSON, cộng thêm các bản ghi và ảnh thu nhỏ nó đọc từ đĩa.

## Tài liệu

| | |
|---|---|
| [Tính năng](../FEATURES.md) | Mọi khả năng, route và thủ tục đã phát hành |
| [Kiến trúc](../../ARCHITECTURE.md) | Các mảnh ghép khớp với nhau ra sao |
| [Đóng góp](../../CONTRIBUTING.md) | Thiết lập môi trường dev, script, quy trình PR |
| [Ví dụ](../../examples/) | Camera Raspberry Pi, luồng giả để kiểm thử |

## Đóng góp

Rất hoan nghênh issue và PR. `pnpm install && pnpm dev` dựng cho bạn nguyên bộ stack kèm dữ liệu mẫu — xem [CONTRIBUTING.md](../../CONTRIBUTING.md) để biết phần còn lại, và lưu ý tiêu đề PR theo [conventional commits](../../CONTRIBUTING.md). Dự án này tuân theo [Quy tắc ứng xử](../../CODE_OF_CONDUCT.md).

## Giấy phép

[MIT](../../LICENSE)
