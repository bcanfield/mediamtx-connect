<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Interfejs webowy dla <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Oglądaj transmisje na żywo, przeglądaj nagrania, edytuj każdy klucz konfiguracji — z przeglądarki.</p>

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

To towarzysz, nie zamiennik. Każdy ekran opiera się na czymś, co MediaMTX już udostępnia: na path, endpoincie API, hooku `runOn*`, protokole serwowanym natywnie. Nie przechowuje wideo, nie pośredniczy w mediach, nie ma bazy danych.

## Szybki start

Obrazy wieloarchitekturowe (`linux/amd64`, `linux/arm64`) — Docker pobierze właściwy.

**MediaMTX już działa?** Dostaw Connect obok:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Zaczynasz od zera?** Dołączony compose uruchamia oba:

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

- **WebRTC albo HLS, dla każdej karty.** `AUTO` po cichu schodzi do HLS, `LOW-LAT` wymaga WebRTC, `COMPAT` wymusza HLS — a każda karta pokazuje transport, który faktycznie dostała.
- **Zrzuty w bezczynności.** Zadanie w tle trzyma na każdej karcie świeżą klatkę, a jej wiek widnieje na plakietce.
- **Telemetria na żywo.** Kodeki, liczba widzów i czas online, prosto z listy path.
- **Uczciwy stan nagrywania.** Karty pokazują, czy strumień nagrywa *faktycznie*; stanu, którego Connect nie odczytał, nie nazywa wyłączonym, tylko nieznanym.
- **Adresy publikacji do schowka.** RTSP, RTMP i SRT, budowane z adresów nasłuchu samego serwera.

### Nagrania

- Pliki MP4 każdego strumienia, pogrupowane dniami, z automatycznymi miniaturami.
- Odtwarzacz rozwijany w miejscu, przewijalny dzięki żądaniom HTTP Range.
- Pobieranie strumieniowe, z postępem na żywo i anulowaniem.
- Naciśnij `/`, aby filtrować.

### Konfiguracja bez YAML-a

- **Cała konfiguracja serwera** — 65 typowanych i walidowanych kontrolek w Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC i SRT.
- **Path defaults i nadpisania per path**, w zakresach, z których MediaMTX je serwuje. Zapis strumienia objętego wildcardem tworzy rzadki wpis, więc nietknięte klucze dalej dziedziczą.
- **Wszystkie 15 hooków `runOn*`**, z ostrzeżeniem tam, gdzie zapis restartuje path.
- **Rzadkie zapisy** — tylko zmienione klucze.

### Utrzymanie

Jeden proces na API, SPA i media · wieloarchitekturowość · `GET /health` · logi strukturalne · PWA · jasny i ciemny · 30 języków · bez bazy danych.

## Zmienne środowiskowe

Zasilają tylko pierwszy start. Reszta zostaje edytowalna w **Config**.

| Zmienna | Domyślnie | Do czego służy |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Gdzie Connect sięga po API MediaMTX z wnętrza swojego kontenera |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Ścieżka hosta montowana pod nagrania (tylko compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Gdzie trafiają miniatury |

`http://mediamtx` rozwiązuje się tylko w sieci dołączonego compose — przy samodzielnym `docker run` wskaż własny host.

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

Odtwarzanie idzie z przeglądarki do MediaMTX. Connect przenosi tylko JSON oraz nagrania i miniatury czytane z dysku.

## Dokumentacja

| | |
|---|---|
| [Funkcje](../FEATURES.md) | Wszystkie wydane możliwości, trasy i procedury |
| [Architektura](../../ARCHITECTURE.md) | Jak elementy do siebie pasują |
| [Współtworzenie](../../CONTRIBUTING.md) | Środowisko dev, skrypty, proces PR |
| [Przykłady](../../examples/) | Kamera Raspberry Pi, sztuczne strumienie do testów |

## Współtworzenie

Zgłoszenia i PR-y mile widziane. `pnpm install && pnpm dev` stawia pełny stos z danymi testowymi — reszta w [CONTRIBUTING.md](../../CONTRIBUTING.md), a tytuły PR-ów to conventional commits. Przestrzegamy [Kodeksu postępowania](../../CODE_OF_CONDUCT.md).

## Licencja

[MIT](../../LICENSE)
