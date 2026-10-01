<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> için web arayüzü.</strong><br>
Canlı yayınları izleyin, kayıtlara göz atın ve MediaMTX yapılandırmanızı tarayıcıdan düzenleyin.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — canlı yayın ızgarası, kayıt tarayıcısı ve yapılandırma düzenleyici" width="860">

<details>
<summary>🌍 30 dilde okuyun</summary>
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
  🇹🇷 <strong>Türkçe</strong> •
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
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## Bu nedir

MediaMTX arayüzsüz gelen mükemmel bir yayın sunucusudur. Connect onun eksik ön yüzü: MediaMTX API'siyle konuşan tek bir konteyner, onu bir kamera duvarına, bir kayıt arşivine ve bir yapılandırma düzenleyicisine dönüştürür.

Yerine geçen değil, yanında duran bir araç. Her ekran MediaMTX'in zaten sunduğu bir şeye karşılık gelir: bir path, bir API uç noktası, bir `runOn*` kancası, doğrudan servis ettiği bir protokol. Video saklamaz, medyayı vekillemez, veritabanı tutmaz.

## Hızlı başlangıç

Çok mimarili imajlar (`linux/amd64`, `linux/arm64`); Docker doğrusunu indirir.

**MediaMTX zaten çalışıyor mu?** Connect'i yanına ekleyin:

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

**Sıfırdan mı başlıyorsunuz?** Birlikte gelen compose, Connect'i derler ve MediaMTX'in yanında çalıştırır:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Ardından <http://localhost:3000> adresini açın.

> [!IMPORTANT]
> Connect'in `mediamtx.yml` dosyanızda `api: yes` olmasına ihtiyacı var. [Birlikte gelen yapılandırma](../../mediamtx.yml) olduğu gibi çalışır.

## Neler elde edersiniz

### Canlı görünüm

MediaMTX'in bildiği tüm path'ler, 2–4 sütunluk bir ızgarada.

- **Kart başına WebRTC veya HLS.** `AUTO` sessizce geri düşer, `LOW-LAT` WebRTC'de ısrar eder, `COMPAT` HLS'i dayatır. Her kart gerçekten elde ettiği taşımayı bildirir.
- **Boştayken de anlık görüntü.** Bir arka plan işi her kartta güncel bir kare tutar, karenin yaşı da rozette yazar. Hemen yenisi mi lazım? Kart menüsünden alın.
- **Canlı telemetri.** Kodekler, izleyici sayısı ve çalışma süresi, doğrudan path listesinden.
- **Dürüst kayıt durumu.** Kartlar bir yayının *fiilen* kayıtta olup olmadığını gösterir; Connect'in okuyamadığı bir durum kapalı değil, bilinmiyor olarak görünür.
- **Yayınlama URL'leri panoya.** RTSP, RTMP ve SRT, sunucunun kendi dinleme adreslerinden üretilir. Her path'in sayfası bir adım öteye gider ve bir yayınlama ve okuma paneli sunar: sunucunun servis ettiği her protokol, WHIP, WHEP, HLS ve TLS varyantları dahil, kopyalamaya hazır ffmpeg, GStreamer, OBS, ffplay ve VLC parçacıklarıyla.

### Kayıtlar

- MediaMTX'in oynatma sunucusundan her yayın için bir günlük zaman çizelgesi: kaydedilmiş aralıklar ve aralarındaki boşluklar, her biri oynatılabilir. Oynatma kapalıysa Connect gereken yapılandırma değişikliklerini tek tek listeler ve tek tıkla uygular.
- Klip indirme: bir saate kadar herhangi bir aralık (ya da son 5 dk, 15 dk veya bir saat) tek bir düz MP4 olarak; segmentler MediaMTX tarafından yeniden kodlanmadan birleştirilir.
- Yayın başına MP4 veya MPEG-TS segmentleri, güne göre gruplanmış, otomatik oluşturulan küçük resimlerle.
- Yerinde açılan gömülü oynatıcı; HTTP aralık istekleriyle sarılabilir.
- Canlı ilerleme ve iptal içeren akışlı indirmeler.
- Filtrelemek için `/` tuşuna basın.

### Oturumlar

- **Bağlı olan herkes, tek tabloda.** RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC ve HLS üzerinden yayıncılar ve okuyucular; uzak adres, gelen ve giden bayt ve çalışma süresiyle, her 5 saniyede bir yenilenir.
- **Bir istemciyi atın**, onay verdikten sonra. Yeniden bağlanabilir; atmak yasaklamak değildir.

### YAML olmadan yapılandırma

- **Sunucu yapılandırması:** Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC ve SRT boyunca tipli ve doğrulanmış 66 denetim.
- **Path varsayılanları ve path başına geçersiz kılmalar**, MediaMTX'in bunları sunduğu kapsamlarda. Joker karakterle kapsanan bir yayını kaydetmek seyrek bir girdi yazar; böylece dokunmadığınız anahtarlar varsayılanları izlemeyi sürdürür.
- **Bir path kataloğu**: canlı ve regex rozetleri, rehberli bir "RTSP kamerası ekle" formu ve her path'in kendi girdisi için geri alma veya silme (bağlı biri varsa uyarıyla).
- **Her path'in sayfasında canlı sağlık durumu:** izler, okuyucular, aktarılan bayt, hatalı kareler ve çalışma süresi, her 5 saniyede bir yenilenir. Hiçbir şey yayınlamayan bir path bozuk değil, boşta görünür.
- **Her path'te dayanıklılık:** kamera kapalıyken çevrimdışı bir klibi döngüde oynatan, her zaman hazır bir yedek; ve kaynağı yalnızca biri izlerken açan isteğe bağlı çekme.
- **Her `runOn*` kancası**, kaydetmenin path'i yeniden başlattığı yerlerde uyarıyla.
- **Yönlendirme:** bir path'i MediaMTX'in yerel `forward` listesi üzerinden YouTube'a, Twitch'e veya başka bir sunucuya gönderin; yayın anahtarları maskelenir, path yeniden başlamaz.
- **Seyrek yazma.** Yalnızca değiştirdiğiniz anahtarlar gönderilir.

### İşletim

API, SPA ve medya için tek süreç · çok mimarili · `GET /api/health` · başlıkta MediaMTX sürümü · yapılandırılmış loglar · PWA olarak yüklenebilir · açık ve koyu · 30 dil · veritabanı yok.

## Ortam değişkenleri

Bunlar ilk açılışı tohumlar. Her şey **Config** altında düzenlenebilir kalır.

| Değişken | İmajdaki varsayılan | Amaç |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect'in MediaMTX API'sine ulaştığı yer |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API portu |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | *Tarayıcının* oynatma için MediaMTX'e ulaştığı yer. Tarayıcı sunucuda değilse her zaman ayarlayın |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Connect'in kayıtları okuduğu yer |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Anlık görüntülerin ve küçük resimlerin saklandığı yer |
| `DATA_DIR` | `/data` | `config.json` dosyasının bulunduğu yer |
| `PORT` | `3000` | HTTP portu |
| `LOG_LEVEL` | `info` | Pino log düzeyi |

`http://mediamtx` yalnızca birlikte gelen compose ağında çözülür. Tek başına bir `docker run` için kendi makinenizi yazın. Compose ile `REMOTE_MEDIAMTX_URL` yerine `.env` içinde `REMOTE_MEDIAMTX_HOST` ayarlayın: bu, MediaMTX'in duyurduğu WebRTC ana makinesini de belirler. [`.env.example`](../../.env.example) her birini açıklar; `pnpm dev` ise hiç `.env` olmadan localhost varsayılanlarını kullanır.

## Nasıl çalışır

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

Canlı oynatma tarayıcıdan doğrudan MediaMTX'e gider. Connect JSON taşır, bir de kayıtlar ile küçük resimleri: diskten okuduklarını ya da MediaMTX'in oynatma sunucusundan vekillediği kaydedilmiş aralıkları.

## Belgeler

| | |
|---|---|
| [Özellikler](../../docs/FEATURES.md) | Yayınlanan her yetenek, rota ve prosedür |
| [Mimari](../../docs/ARCHITECTURE.md) | Parçaların nasıl birleştiği |
| [Katkıda bulunma](../../CONTRIBUTING.md) | Geliştirme kurulumu, betikler, PR süreci |
| [Örnekler](../../examples/) | Raspberry Pi kamerası, test için sahte yayınlar |

## Katkıda bulunma

Issue ve PR'lar memnuniyetle karşılanır. `pnpm install && pnpm dev` size örnek verilerle dolu tam bir yığın verir. [CONTRIBUTING.md](../../CONTRIBUTING.md) dosyasına bakın ve PR başlıklarının conventional commits biçiminde olduğunu unutmayın. Bir [Davranış Kuralları](../../CODE_OF_CONDUCT.md) belgesine uyuyoruz.

## Lisans

[MIT](../../LICENSE)
