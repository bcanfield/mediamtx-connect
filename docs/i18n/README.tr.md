<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong><a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> için web arayüzü.</strong><br>
Canlı yayınları izleyin, kayıtlara göz atın, her yapılandırma anahtarını düzenleyin — tarayıcınızdan.</p>

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

Yerine geçen değil, yanında duran bir araç. Her ekran MediaMTX'in zaten sunduğu bir şeye oturur: bir path, bir API uç noktası, bir `runOn*` kancası, doğrudan servis ettiği bir protokol. Video saklamaz, medyayı vekillemez, veritabanı tutmaz.

## Hızlı başlangıç

Çok mimarili imajlar (`linux/amd64`, `linux/arm64`) — Docker doğrusunu indirir.

**MediaMTX zaten çalışıyor mu?** Connect'i yanına ekleyin:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Sıfırdan mı başlıyorsunuz?** Birlikte gelen compose ikisini de ayağa kaldırır:

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

- **Kart başına WebRTC veya HLS.** `AUTO` sessizce HLS'e düşer, `LOW-LAT` WebRTC'de ısrar eder, `COMPAT` HLS'i dayatır — ve her kart gerçekten elde ettiği taşımayı bildirir.
- **Boştayken de anlık görüntü.** Bir arka plan işi her kartta güncel bir kare tutar, karenin yaşı da rozette yazar.
- **Canlı telemetri.** Kodekler, izleyici sayısı ve çalışma süresi, doğrudan path listesinden.
- **Dürüst kayıt durumu.** Kartlar bir yayının *fiilen* kayıtta olup olmadığını gösterir; Connect'in okuyamadığı bir durum kapalı değil, bilinmiyor olarak görünür.
- **Yayınlama URL'leri panoya.** RTSP, RTMP ve SRT, sunucunun kendi dinleme adreslerinden üretilir.

### Kayıtlar

- Her yayının MP4'leri, güne göre gruplanmış, otomatik küçük resimlerle.
- Yerinde açılan gömülü oynatıcı; HTTP Range istekleriyle sarılabilir.
- Canlı ilerleme ve iptal içeren akışlı indirmeler.
- Filtrelemek için `/` tuşuna basın.

### YAML olmadan yapılandırma

- **Sunucu yapılandırmasının tamamı** — Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC ve SRT boyunca tipli ve doğrulanmış 65 denetim.
- **Path varsayılanları ve path başına geçersiz kılmalar**, MediaMTX'in bunları sunduğu kapsamlarda. Joker karakterle kapsanan bir yayını kaydetmek seyrek bir girdi yazar; dokunmadığınız anahtarlar devralmayı sürdürür.
- **15 `runOn*` kancasının tamamı**, kaydetmenin path'i yeniden başlattığı yerlerde uyarıyla.
- **Seyrek yazma** — yalnızca değiştirdiğiniz anahtarlar.

### İşletim

API, SPA ve medya için tek süreç · çok mimarili · `GET /health` · yapılandırılmış loglar · PWA · açık ve koyu · 30 dil · veritabanı yok.

## Ortam değişkenleri

Yalnızca ilk açılışı tohumlar. Gerisi **Config** altında düzenlenebilir kalır.

| Değişken | Varsayılan | Amaç |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Connect'in kendi konteynerinin içinden MediaMTX API'sine ulaştığı yer |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API portu |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Kayıtlar için bağlanan ana makine yolu (yalnızca compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Küçük resimlerin saklandığı yer |

`http://mediamtx` yalnızca birlikte gelen compose ağında çözülür — tek başına bir `docker run` için kendi makinenizi yazın.

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

Oynatma tarayıcıdan MediaMTX'e gider. Connect yalnızca JSON taşır, bir de diskten okuduğu kayıtlar ile küçük resimleri.

## Belgeler

| | |
|---|---|
| [Özellikler](../FEATURES.md) | Yayınlanan her yetenek, rota ve prosedür |
| [Mimari](../../ARCHITECTURE.md) | Parçaların nasıl birleştiği |
| [Katkıda bulunma](../../CONTRIBUTING.md) | Geliştirme kurulumu, betikler, PR süreci |
| [Örnekler](../../examples/) | Raspberry Pi kamerası, test için sahte yayınlar |

## Katkıda bulunma

Issue ve PR'lar memnuniyetle karşılanır. `pnpm install && pnpm dev` size örnek verilerle dolu tam bir yığın verir — gerisi için [CONTRIBUTING.md](../../CONTRIBUTING.md); ayrıca PR başlıkları conventional commits biçimindedir. Bir [Davranış Kuralları](../../CODE_OF_CONDUCT.md) belgesine uyuyoruz.

## Lisans

[MIT](../../LICENSE)
