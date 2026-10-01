<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Interfejs webowy dla <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Oglądaj transmisje na żywo, przeglądaj nagrania i edytuj konfigurację MediaMTX z przeglądarki.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — siatka transmisji na żywo, przeglądarka nagrań i edytor konfiguracji" width="860">

<details>
<summary>🌍 Czytaj w 30 językach</summary>
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
  🇵🇱 <strong>Polski</strong> •
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
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## Czym to jest

MediaMTX to świetny serwer streamingowy bez interfejsu. Connect to brakujący front-end: jeden kontener, który rozmawia z API MediaMTX i zamienia je w ścianę kamer, archiwum nagrań i edytor konfiguracji.

To towarzysz, nie zamiennik. Każdy ekran odpowiada czemuś, co MediaMTX już udostępnia: path, endpointowi API, hookowi `runOn*`, protokołowi serwowanemu natywnie. Nie przechowuje wideo, nie pośredniczy w mediach, nie ma bazy danych.

## Szybki start

Obrazy wieloarchitekturowe (`linux/amd64`, `linux/arm64`); Docker pobierze właściwy.

**MediaMTX już działa?** Dostaw Connect obok:

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

**Zaczynasz od zera?** Dołączony compose buduje Connect i uruchamia go obok MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Następnie otwórz <http://localhost:3000>.

> [!IMPORTANT]
> Connect potrzebuje `api: yes` w twoim `mediamtx.yml`. [Dołączona konfiguracja](../../mediamtx.yml) działa bez zmian.

## Co dostajesz

### Podgląd na żywo

Wszystkie path, które zna MediaMTX, w siatce 2–4 kolumn.

- **WebRTC albo HLS, dla każdej karty.** `AUTO` po cichu przełącza się na zapas, `LOW-LAT` wymaga WebRTC, `COMPAT` wymusza HLS. Każda karta pokazuje transport, który faktycznie dostała.
- **Zrzuty w bezczynności.** Zadanie w tle trzyma na każdej karcie świeżą klatkę, a jej wiek widnieje na plakietce. Potrzebujesz nowej od razu? Zrób ją z menu karty.
- **Telemetria na żywo.** Kodeki, liczba widzów i czas online, prosto z listy path.
- **Uczciwy stan nagrywania.** Karty pokazują, czy strumień nagrywa *faktycznie*; stan, którego Connect nie odczytał, jest oznaczony jako nieznany, nigdy jako wyłączony.
- **Adresy publikacji do schowka.** RTSP, RTMP i SRT, budowane z adresów nasłuchu samego serwera. Strona każdego path idzie dalej z panelem publikacji i odczytu: każdy protokół, który serwuje serwer, w tym WHIP, WHEP, HLS i warianty TLS, z gotowymi do skopiowania fragmentami dla ffmpeg, GStreamer, OBS, ffplay i VLC.

### Nagrania

- Dzienna oś czasu dla każdego strumienia z serwera odtwarzania MediaMTX: nagrane odcinki i przerwy między nimi, każdy do odtworzenia. Jeśli odtwarzanie jest wyłączone, Connect wypisuje dokładne zmiany konfiguracji, których potrzebuje, i stosuje je jednym kliknięciem.
- Pobieranie klipów: dowolny zakres do godziny (albo ostatnie 5 min, 15 min lub godzina) jako jeden zwykły plik MP4, sklejony z segmentów przez MediaMTX bez ponownego kodowania.
- Segmenty MP4 lub MPEG-TS każdego strumienia, pogrupowane dniami, z automatycznie generowanymi miniaturami.
- Wbudowany odtwarzacz rozwijany w miejscu, przewijalny dzięki żądaniom HTTP Range.
- Pobieranie strumieniowe, z postępem na żywo i anulowaniem.
- Naciśnij `/`, aby filtrować.

### Sesje

- **Wszyscy połączeni, w jednej tabeli.** Nadawcy i odbiorcy przez RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC i HLS, z adresem zdalnym, bajtami przychodzącymi i wychodzącymi oraz czasem połączenia, odświeżani co 5 sekund.
- **Wyrzuć klienta** po potwierdzeniu. Może połączyć się ponownie; wyrzucenie to nie blokada.

### Konfiguracja bez YAML-a

- **Konfiguracja serwera:** 66 typowanych i walidowanych kontrolek w Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC i SRT.
- **Path defaults i nadpisania per path**, w zakresach, z których MediaMTX je serwuje. Zapis strumienia objętego wildcardem tworzy rzadki wpis, więc nietknięte klucze dalej podążają za wartościami domyślnymi.
- **Katalog path** z plakietkami „na żywo” i regex, prowadzonym formularzem „dodaj kamerę RTSP” oraz cofaniem lub usuwaniem własnego wpisu dowolnego path (z ostrzeżeniem, jeśli ktoś jest połączony).
- **Stan na żywo na stronie każdego path:** ścieżki, odbiorcy, przesłane bajty, błędne klatki i czas działania, odświeżane co 5 sekund. Path, na którym nic nie jest publikowane, jest bezczynny, a nie zepsuty.
- **Odporność na każdym path:** zawsze dostępny fallback, który zapętla klip offline, gdy kamera nie działa, oraz pobieranie na żądanie, które otwiera źródło tylko wtedy, gdy ktoś ogląda.
- **Każdy hook `runOn*`**, z ostrzeżeniem tam, gdzie zapis restartuje path.
- **Przekazywanie:** wypchnij path do YouTube, Twitcha lub innego serwera przez natywną listę `forward` MediaMTX, z zamaskowanymi kluczami strumienia i bez restartu path.
- **Rzadkie zapisy.** Wysyłane są tylko klucze, które zmieniłeś.

### Utrzymanie

Jeden proces na API, SPA i media · wieloarchitekturowość · `GET /api/health` · wersja MediaMTX w nagłówku · logi strukturalne · instalowalne jako PWA · ciemny i jasny · 30 języków · bez bazy danych.

## Zmienne środowiskowe

Zasilają tylko pierwszy start. Wszystko zostaje edytowalne w **Config**.

| Zmienna | Domyślnie w obrazie | Do czego służy |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Gdzie Connect sięga po API MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Gdzie *przeglądarka* sięga po MediaMTX przy odtwarzaniu. Ustaw ją zawsze, gdy przeglądarka nie działa na serwerze |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Skąd Connect czyta nagrania |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Gdzie trafiają zrzuty i miniatury |
| `DATA_DIR` | `/data` | Gdzie leży `config.json` |
| `PORT` | `3000` | Port HTTP |
| `LOG_LEVEL` | `info` | Poziom logowania Pino |

`http://mediamtx` rozwiązuje się tylko w sieci dołączonego compose. Przy samodzielnym `docker run` wskaż własny host. Z compose ustaw `REMOTE_MEDIAMTX_HOST` w `.env` zamiast `REMOTE_MEDIAMTX_URL`: ustawia to też host WebRTC, który ogłasza MediaMTX. [`.env.example`](../../.env.example) objaśnia każdą z nich, a `pnpm dev` używa domyślnych wartości dla localhost bez żadnego `.env`.

## Jak to działa

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

Odtwarzanie na żywo idzie z przeglądarki do MediaMTX. Connect przenosi JSON oraz nagrania i miniatury: z dysku albo nagrane odcinki pośredniczone z serwera odtwarzania MediaMTX.

## Dokumentacja

| | |
|---|---|
| [Funkcje](../../docs/FEATURES.md) | Wszystkie wydane możliwości, trasy i procedury |
| [Architektura](../../docs/ARCHITECTURE.md) | Jak elementy do siebie pasują |
| [Współtworzenie](../../CONTRIBUTING.md) | Środowisko dev, skrypty, proces PR |
| [Przykłady](../../examples/) | Kamera Raspberry Pi, sztuczne strumienie do testów |

## Współtworzenie

Zgłoszenia i PR-y mile widziane. `pnpm install && pnpm dev` stawia pełny stos z danymi testowymi. Zajrzyj do [CONTRIBUTING.md](../../CONTRIBUTING.md) i pamiętaj, że tytuły PR-ów to conventional commits. Przestrzegamy [Kodeksu postępowania](../../CODE_OF_CONDUCT.md).

## Licencja

[MIT](../../LICENSE)
