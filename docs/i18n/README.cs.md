<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Webové rozhraní pro <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Sledujte živé streamy, procházejte nahrávky a upravujte konfiguraci MediaMTX přímo v prohlížeči.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — mřížka živých streamů, prohlížeč nahrávek a editor konfigurace" width="860">

<details>
<summary>🌍 Číst ve 30 jazycích</summary>
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
  🇨🇿 <strong>Čeština</strong> •
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

## Co to je

MediaMTX je vynikající streamovací server bez rozhraní. Connect je chybějící front-end: jeden kontejner, který mluví s API MediaMTX a promění ho v kamerovou stěnu, archiv nahrávek a editor konfigurace.

Je to společník, ne náhrada. Každá obrazovka odpovídá něčemu, co MediaMTX už vystavuje: path, endpointu API, hooku `runOn*`, protokolu, který nativně obsluhuje. Neukládá video, nepřeposílá média, nemá databázi.

## Rychlý start

Multiarchitekturní image (`linux/amd64`, `linux/arm64`); Docker stáhne tu správnou.

**MediaMTX už běží?** Postavte Connect vedle něj:

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

**Začínáte od nuly?** Přiložený compose sestaví Connect a spustí ho vedle MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Pak otevřete <http://localhost:3000>.

> [!IMPORTANT]
> Connect potřebuje `api: yes` ve vašem `mediamtx.yml`. [Přiložená konfigurace](../../mediamtx.yml) funguje tak, jak je.

## Co dostanete

### Živý pohled

Všechny path, které MediaMTX zná, v mřížce o 2 až 4 sloupcích.

- **WebRTC nebo HLS, pro každou kartu.** `AUTO` tiše přejde na záložní variantu, `LOW-LAT` trvá na WebRTC, `COMPAT` vynutí HLS. Každá karta hlásí transport, který opravdu dostala.
- **Snímky i v nečinnosti.** Úloha na pozadí drží na každé kartě čerstvý snímek a na štítku jeho stáří. Potřebujete nový hned? Pořiďte ho z nabídky karty.
- **Živá telemetrie.** Kodeky, počet diváků a doba běhu, rovnou ze seznamu path.
- **Poctivý stav nahrávání.** Karty ukazují, jestli stream *skutečně* nahrává; stav, který Connect nepřečetl, je neznámý, nikdy vypnutý.
- **Publikační adresy do schránky.** RTSP, RTMP a SRT, složené z vlastních naslouchacích adres serveru. Stránka každé path jde dál s panelem pro publikování a čtení: každý protokol, který server obsluhuje, včetně WHIP, WHEP, HLS a variant s TLS, s připravenými úryvky pro ffmpeg, GStreamer, OBS, ffplay a VLC.

### Nahrávky

- Denní časová osa pro každý stream z přehrávacího serveru MediaMTX: nahrané úseky a mezery mezi nimi, každý přehratelný. Když je přehrávání vypnuté, Connect vypíše přesně ty změny konfigurace, které potřebuje, a jedním kliknutím je použije.
- Stažení klipu: libovolný rozsah až do hodiny (nebo posledních 5 min, 15 min či hodina) jako jedno obyčejné MP4, které MediaMTX poskládá napříč segmenty bez překódování.
- Segmenty MP4 nebo MPEG-TS pro každý stream, seskupené po dnech, s automaticky generovanými náhledy.
- Vložený přehrávač, který se rozbalí na místě, převíjitelný přes HTTP požadavky s rozsahem.
- Streamované stahování s živým průběhem a zrušením.
- Stiskněte `/` a filtrujte.

### Relace

- **Všichni připojení v jedné tabulce.** Vydavatelé a čtenáři přes RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC a HLS, se vzdálenou adresou, přijatými a odeslanými bajty a dobou běhu, obnovováno každých 5 sekund.
- **Vyhoďte klienta** po potvrzení. Může se znovu připojit; vyhození není zákaz.

### Konfigurace bez YAML

- **Konfigurace serveru:** 66 typovaných a validovaných ovládacích prvků napříč Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC a SRT.
- **Path defaults a overridy pro jednotlivé path**, v rozsazích, ze kterých je MediaMTX obsluhuje. Uložení streamu krytého zástupným znakem zapíše řídký záznam, takže nedotčené klíče dál sledují výchozí hodnoty.
- **Katalog path** se štítky živé a regex, s průvodcem formulářem „přidat kameru RTSP“ a s vrácením nebo smazáním vlastního záznamu kterékoli path (s varováním, pokud je někdo připojen).
- **Živý stav na stránce každé path:** stopy, čtenáři, přenesené bajty, chybné snímky a doba běhu, obnovováno každých 5 sekund. Path, do které nic nepublikuje, je nečinná, ne rozbitá.
- **Odolnost na každé path:** vždy dostupná záloha, která přehrává offline klip ve smyčce, dokud je kamera mimo provoz, a stahování na vyžádání, které otevře zdroj jen tehdy, když se někdo dívá.
- **Každý hook `runOn*`**, s varováním tam, kde uložení restartuje path.
- **Přeposílání:** pošlete path na YouTube, Twitch nebo jiný server přes nativní seznam `forward` v MediaMTX, s maskovanými klíči streamu a bez restartu path.
- **Řídké zápisy.** Odešlou se jen klíče, které jste změnili.

### Provoz

Jediný proces pro API, SPA i média · multiarchitektura · `GET /api/health` · verze MediaMTX v záhlaví · strukturované logy · instalovatelné jako PWA · světlý i tmavý · 30 jazyků · žádná databáze.

## Proměnné prostředí

Naplní první start. Vše zůstává měnitelné v **Config**.

| Proměnná | Výchozí v image | K čemu je |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Kde Connect dosáhne na API MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Port API MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Kde *prohlížeč* dosáhne na MediaMTX kvůli přehrávání. Nastavte ji vždy, když prohlížeč neběží na serveru |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Odkud Connect čte nahrávky |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Kam se ukládají snímky a náhledy |
| `DATA_DIR` | `/data` | Kde leží `config.json` |
| `PORT` | `3000` | Port HTTP |
| `LOG_LEVEL` | `info` | Úroveň logování Pino |

`http://mediamtx` se přeloží jen v síti přiloženého compose. Pro samostatný `docker run` nastavte vlastního hostitele. S compose nastavte místo `REMOTE_MEDIAMTX_URL` v `.env` proměnnou `REMOTE_MEDIAMTX_HOST`: určuje i hostitele WebRTC, kterého MediaMTX ohlašuje. [`.env.example`](../../.env.example) vysvětluje každou z nich a `pnpm dev` používá výchozí hodnoty pro localhost úplně bez `.env`.

## Jak to funguje

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

Živé přehrávání jde z prohlížeče přímo do MediaMTX. Connect přenáší JSON a k tomu nahrávky a náhledy: z disku, nebo nahrané úseky přeposílané z přehrávacího serveru MediaMTX.

## Dokumentace

| | |
|---|---|
| [Funkce](../../docs/FEATURES.md) | Každá vydaná schopnost, routa a procedura |
| [Architektura](../../docs/ARCHITECTURE.md) | Jak do sebe díly zapadají |
| [Přispívání](../../CONTRIBUTING.md) | Vývojové prostředí, skripty, proces PR |
| [Příklady](../../examples/) | Kamera Raspberry Pi, falešné streamy pro testy |

## Přispívání

Issues a PR jsou vítány. `pnpm install && pnpm dev` vám postaví celý stack i s testovacími daty. Podívejte se do [CONTRIBUTING.md](../../CONTRIBUTING.md) a mějte na paměti, že názvy PR jsou conventional commits. Řídíme se [Kodexem chování](../../CODE_OF_CONDUCT.md).

## Licence

[MIT](../../LICENSE)
