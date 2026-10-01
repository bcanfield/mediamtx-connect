<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Giao diện web cho <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Xem luồng trực tiếp, duyệt bản ghi và sửa cấu hình MediaMTX của bạn ngay trong trình duyệt.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — lưới luồng trực tiếp, trình duyệt bản ghi và trình sửa cấu hình" width="860">

<details>
<summary>🌍 Đọc bằng 30 ngôn ngữ</summary>
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
</details>

</div>

## Đây là gì

MediaMTX là một máy chủ phát trực tuyến xuất sắc nhưng không có giao diện. Connect chính là phần front-end còn thiếu: một container nói chuyện với API của MediaMTX và biến nó thành bức tường camera, kho lưu bản ghi và trình sửa cấu hình.

Đây là bạn đồng hành, không phải bản thay thế. Mọi màn hình đều dựa trên thứ MediaMTX vốn đã cung cấp: một path, một endpoint API, một hook `runOn*`, một giao thức nó phục vụ sẵn. Không lưu video, không proxy media, không dùng cơ sở dữ liệu.

## Bắt đầu nhanh

Image đa kiến trúc (`linux/amd64`, `linux/arm64`); Docker sẽ tải đúng bản.

**Đã chạy MediaMTX rồi?** Đặt Connect bên cạnh nó:

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

**Bắt đầu từ con số không?** File compose đi kèm sẽ build Connect và chạy nó cạnh MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Sau đó mở <http://localhost:3000>.

> [!IMPORTANT]
> Connect cần `api: yes` trong `mediamtx.yml` của bạn. [Cấu hình đi kèm](../../mediamtx.yml) chạy được ngay.

## Bạn nhận được gì

### Xem trực tiếp

Mọi path mà MediaMTX biết, trong lưới 2 đến 4 cột.

- **WebRTC hay HLS, tùy từng thẻ.** `AUTO` lặng lẽ chuyển sang phương án dự phòng, `LOW-LAT` nhất quyết dùng WebRTC, `COMPAT` ép dùng HLS. Mỗi thẻ báo đúng phương thức truyền tải nó thực sự có được.
- **Ảnh chụp ngay cả khi rảnh.** Một tác vụ nền giữ một khung hình mới trên mỗi thẻ, kèm tuổi của nó trên nhãn. Cần ảnh mới ngay bây giờ? Chụp từ menu của thẻ.
- **Đo lường trực tiếp.** Codec, số người xem và thời gian trực tuyến, lấy thẳng từ danh sách path.
- **Trạng thái ghi trung thực.** Thẻ cho biết luồng có đang ghi *trên thực tế* hay không; trạng thái mà Connect không đọc được sẽ là chưa rõ, chứ không phải tắt.
- **URL phát lên vào clipboard.** RTSP, RTMP và SRT, dựng từ chính địa chỉ lắng nghe của máy chủ. Trang của mỗi path còn đi xa hơn với bảng phát lên và đọc: mọi giao thức máy chủ phục vụ, kể cả WHIP, WHEP, HLS và các biến thể TLS, kèm đoạn lệnh ffmpeg, GStreamer, OBS, ffplay và VLC sẵn sàng để sao chép.

### Bản ghi

- Dòng thời gian theo ngày cho từng luồng, lấy từ máy chủ phát lại của MediaMTX: các đoạn đã ghi và khoảng trống giữa chúng, đoạn nào cũng phát được. Nếu tính năng phát lại đang tắt, Connect liệt kê chính xác những thay đổi cấu hình cần thiết và áp dụng chúng chỉ với một cú nhấp.
- Tải clip: bất kỳ khoảng nào dài tối đa một giờ (hoặc 5 phút, 15 phút hay một giờ gần nhất) thành một file MP4 thông thường, được MediaMTX ghép từ các segment mà không mã hóa lại.
- Các segment MP4 hoặc MPEG-TS của từng luồng, gom theo ngày, kèm ảnh thu nhỏ tự động.
- Trình phát bung ra ngay tại chỗ, tua được nhờ request HTTP Range.
- Tải xuống theo luồng, có tiến độ trực tiếp và nút hủy.
- Nhấn `/` để lọc.

### Phiên kết nối

- **Mọi kết nối, trong một bảng.** Bên phát và bên đọc qua RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC và HLS, kèm địa chỉ từ xa, số byte vào và ra, và thời gian kết nối, làm mới mỗi 5 giây.
- **Ngắt kết nối một client** sau khi xác nhận. Client có thể kết nối lại; ngắt kết nối không phải là cấm.

### Cấu hình, không cần YAML

- **Cấu hình máy chủ:** 66 điều khiển có kiểu và được kiểm tra, trải khắp Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC và SRT.
- **Path defaults và ghi đè theo từng path**, trên đúng phạm vi mà MediaMTX phục vụ chúng. Lưu một luồng nằm dưới ký tự đại diện sẽ ghi một mục thưa, nên những khóa bạn không đụng tới vẫn bám theo giá trị mặc định.
- **Danh mục path** với nhãn live và regex, biểu mẫu có hướng dẫn "thêm camera RTSP", cùng tùy chọn hoàn nguyên hoặc xóa mục riêng của bất kỳ path nào (kèm cảnh báo nếu có người đang kết nối).
- **Tình trạng trực tiếp trên trang của mỗi path:** track, bên đọc, số byte đã truyền, khung hình lỗi và thời gian hoạt động, làm mới mỗi 5 giây. Path không có ai phát lên được hiển thị là nhàn rỗi, không phải hỏng.
- **Khả năng chống chịu cho từng path:** một nguồn dự phòng luôn sẵn sàng phát lặp một clip ngoại tuyến khi camera mất tín hiệu, và chế độ kéo theo yêu cầu chỉ mở nguồn khi có người đang xem.
- **Mọi hook `runOn*`**, kèm cảnh báo ở nơi việc lưu sẽ khởi động lại path.
- **Chuyển tiếp:** đẩy một path lên YouTube, Twitch hoặc máy chủ khác qua danh sách `forward` gốc của MediaMTX, với stream key được che và không phải khởi động lại path.
- **Ghi thưa.** Chỉ những khóa bạn đã đổi mới được gửi đi.

### Vận hành

Một tiến trình cho API, SPA và media · đa kiến trúc · `GET /api/health` · phiên bản MediaMTX trên thanh tiêu đề · log có cấu trúc · cài đặt được dưới dạng PWA · sáng và tối · 30 ngôn ngữ · không cần cơ sở dữ liệu.

## Biến môi trường

Chúng gieo giá trị cho lần khởi động đầu tiên. Mọi thứ vẫn sửa được trong **Config**.

| Biến | Mặc định trong image | Mục đích |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Nơi Connect với tới API của MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Cổng API của MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Nơi *trình duyệt* với tới MediaMTX để phát. Hãy đặt biến này bất cứ khi nào trình duyệt không chạy trên máy chủ |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Nơi Connect đọc bản ghi |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Nơi lưu ảnh chụp và ảnh thu nhỏ |
| `DATA_DIR` | `/data` | Nơi đặt `config.json` |
| `PORT` | `3000` | Cổng HTTP |
| `LOG_LEVEL` | `info` | Mức log của Pino |

`http://mediamtx` chỉ phân giải được trong mạng của file compose đi kèm. Với `docker run` độc lập, hãy trỏ tới host của bạn. Khi dùng compose, hãy đặt `REMOTE_MEDIAMTX_HOST` trong `.env` thay cho `REMOTE_MEDIAMTX_URL`: biến này còn đặt luôn host WebRTC mà MediaMTX quảng bá. [`.env.example`](../../.env.example) giải thích từng biến, và `pnpm dev` dùng mặc định localhost mà không cần `.env` nào cả.

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

Phát trực tiếp đi thẳng từ trình duyệt tới MediaMTX. Connect chuyển JSON, cộng thêm các bản ghi và ảnh thu nhỏ: đọc từ đĩa, hoặc các đoạn đã ghi được proxy từ máy chủ phát lại của MediaMTX.

## Tài liệu

| | |
|---|---|
| [Tính năng](../../docs/FEATURES.md) | Mọi khả năng, route và thủ tục đã phát hành |
| [Kiến trúc](../../docs/ARCHITECTURE.md) | Các mảnh ghép khớp với nhau ra sao |
| [Đóng góp](../../CONTRIBUTING.md) | Thiết lập môi trường dev, script, quy trình PR |
| [Ví dụ](../../examples/) | Camera Raspberry Pi, luồng giả để kiểm thử |

## Đóng góp

Rất hoan nghênh issue và PR. `pnpm install && pnpm dev` dựng cho bạn nguyên bộ stack kèm dữ liệu mẫu. Xem [CONTRIBUTING.md](../../CONTRIBUTING.md), và lưu ý tiêu đề PR theo conventional commits. Chúng tôi tuân theo [Quy tắc ứng xử](../../CODE_OF_CONDUCT.md).

## Giấy phép

[MIT](../../LICENSE)
