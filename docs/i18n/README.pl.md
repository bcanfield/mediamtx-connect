<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Interfejs webowy dla <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Oglądaj transmisje na żywo, przeglądaj nagrania i edytuj każdy klucz konfiguracji — z poziomu przeglądarki.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — siatka transmisji na żywo, przeglądarka nagrań i edytor konfiguracji" width="860">

</div>

## Czym to jest

MediaMTX to świetny serwer streamingowy, który nie ma interfejsu. Connect to brakujący front-end: jeden kontener, który rozmawia z API MediaMTX i zamienia je w ścianę kamer, archiwum nagrań i edytor konfiguracji.

To towarzysz, nie zamiennik. Każdy ekran opiera się na czymś, co MediaMTX już udostępnia — na path, endpoincie API, hooku `runOn*`, protokole, który serwuje natywnie. Connect nie przechowuje wideo, nie pośredniczy w mediach i nie używa bazy danych. Wskaż mu działający serwer i już działa.

## Szybki start

Obrazy publikujemy dla `linux/amd64` i `linux/arm64` (Raspberry Pi, Apple Silicon i pokrewne), więc Docker pobierze właściwy sam.

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

W obu przypadkach otwórz <http://localhost:3000>.

> [!IMPORTANT]
> Connect potrzebuje `api: yes` w twoim `mediamtx.yml` — przez to API czyta i zapisuje wszystko. [Dołączona konfiguracja](../../mediamtx.yml) to działający wzorzec.

## Co dostajesz

### Podgląd na żywo

Siatka wszystkich path, które zna MediaMTX — w 2, 3 lub 4 kolumnach.

- **WebRTC albo HLS, dla każdej karty osobno.** `AUTO` woli WebRTC i po cichu schodzi do HLS, `LOW-LAT` wymaga WebRTC, a `COMPAT` wymusza HLS. Każda karta negocjuje własne połączenie i pokazuje transport, który faktycznie dostała — nigdy ten, o który poprosiłeś.
- **Zrzuty także w bezczynności.** Zadanie w tle pobiera klatkę z każdego strumienia, więc nieaktywne karty wciąż pokazują scenę, a wiek klatki widnieje na plakietce. «Zrób zrzut» pobiera klatkę od razu.
- **Telemetria na żywo.** Plakietki kodeków, liczba widzów i czas online, prosto z listy path — bez dodatkowych żądań.
- **Stan nagrywania, który mówi prawdę.** Karty pokazują, czy strumień nagrywa *faktycznie* (własny override nałożony na path defaults, dokładnie tak, jak rozwiązuje to MediaMTX); stanu, którego nie udało się odczytać, nie pokazujemy jako wyłączony, tylko jako nieznany.
- **Adresy publikacji do schowka.** Cele RTSP, RTMP i SRT budowane z adresów nasłuchu samego serwera, więc zmieniony port nadal jest tym właściwym.

### Nagrania

- Pliki MP4 każdego strumienia, pogrupowane dniami, od najnowszych, z automatycznie generowanymi miniaturami.
- Odtwarzacz rozwijany w miejscu, z prawdziwym paskiem przewijania opartym o żądania HTTP Range.
- Pobieranie strumieniowe z postępem na żywo, prędkością i przyciskiem anulowania.
- Naciśnij `/` w dowolnym miejscu, aby filtrować.

### Konfiguracja bez YAML-a

- **Cała konfiguracja serwera** — 65 kontrolek w sekcjach Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC i SRT, każda typowana, walidowana i opisana w twoim języku.
- **Path defaults i nadpisania per path**, w zakresach, z których MediaMTX naprawdę je serwuje. Zapis strumienia objętego wildcardem materializuje rzadki wpis, więc nietknięte klucze dalej podążają za domyślnymi — a «przywróć dziedziczenie» to cofa.
- **Wszystkie 15 hooków path `runOn*`**, z ostrzeżeniem tam, gdzie zapis restartuje path.
- **Rzadkie zapisy.** Connect PATCH-uje tylko zmienione klucze; czego nie pokazuje, tego nie rusza.

### Zrobione dla pudełka, o którym się zapomina

Jeden proces obsługujący API, SPA i media · obrazy multi-arch · `GET /health` · logi strukturalne · instalowalna PWA · motyw jasny i ciemny · 30 języków · bez bazy danych.

## Zmienne środowiskowe

Wszystko to zmienisz w locie w **Config** — te zmienne zasilają tylko pierwszy start.

| Zmienna | Domyślnie | Do czego służy |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Gdzie Connect sięga po API MediaMTX z *wnętrza* swojego kontenera |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Ścieżka hosta montowana pod nagrania (tylko compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Gdzie trafiają wygenerowane miniatury |

Domyślne `http://mediamtx` rozwiązuje się tylko w sieci dołączonego compose. Przy samodzielnym `docker run` ustaw własny host MediaMTX — albo popraw to później w **Config**, bez restartu.

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

Odtwarzanie idzie z przeglądarki prosto do MediaMTX. Connect przenosi tylko JSON oraz nagrania i miniatury, które czyta z dysku.

## Dokumentacja

| | |
|---|---|
| [Funkcje](../FEATURES.md) | Wszystkie wydane możliwości, trasy i procedury |
| [Architektura](../../ARCHITECTURE.md) | Jak elementy do siebie pasują |
| [Współtworzenie](../../CONTRIBUTING.md) | Środowisko dev, skrypty, proces PR |
| [Przykłady](../../examples/) | Kamera Raspberry Pi, sztuczne strumienie do testów |

## Współtworzenie

Zgłoszenia i PR-y mile widziane. `pnpm install && pnpm dev` stawia pełny stos z danymi testowymi — resztę opisuje [CONTRIBUTING.md](../../CONTRIBUTING.md), a tytuły PR-ów to [conventional commits](../../CONTRIBUTING.md). Projekt przestrzega [Kodeksu postępowania](../../CODE_OF_CONDUCT.md).

## Licencja

[MIT](../../LICENSE)
