<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A interface web do <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Assista às transmissões ao vivo, navegue pelas gravações, edite qualquer chave de configuração — direto do navegador.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grade de transmissões ao vivo, navegador de gravações e editor de configuração" width="860">

<details>
<summary>🌍 Leia em 30 idiomas</summary>
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
  🇧🇷 <strong>Português (BR)</strong> •
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

## O que é

O MediaMTX é um ótimo servidor de streaming sem interface. O Connect é o front-end que falta: um contêiner que conversa com a API do MediaMTX e a transforma em um painel de câmeras, um acervo de gravações e um editor de configuração.

É um companheiro, não um substituto. Cada tela se apoia em algo que o MediaMTX já expõe: um path, um endpoint, um hook `runOn*`, um protocolo que ele serve nativamente. Não guarda vídeo, não faz proxy de mídia, não usa banco de dados.

## Início rápido

Imagens multiarquitetura (`linux/amd64`, `linux/arm64`) — o Docker baixa a certa.

**Já tem o MediaMTX rodando?** Coloque o Connect do lado:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Começando do zero?** O compose incluído sobe os dois:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Depois abra <http://localhost:3000>.

> [!IMPORTANT]
> O Connect precisa de `api: yes` no seu `mediamtx.yml`. A [configuração incluída](../../mediamtx.yml) funciona do jeito que está.

## O que você ganha

### Visão ao vivo

Todos os path que o MediaMTX conhece, numa grade de 2 a 4 colunas.

- **WebRTC ou HLS, card a card.** `AUTO` cai para HLS em silêncio, `LOW-LAT` exige WebRTC, `COMPAT` força HLS — e cada card informa o transporte que de fato conseguiu.
- **Snapshots mesmo parado.** Um job em segundo plano mantém um quadro recente em cada card, com a idade dele na etiqueta.
- **Telemetria ao vivo.** Codecs, espectadores e tempo no ar, tirados da lista de path.
- **Estado de gravação honesto.** Os cards mostram se a transmissão está gravando *de fato*; um estado que o Connect não conseguiu ler aparece como desconhecido, nunca como desligado.
- **URLs de publicação na área de transferência.** RTSP, RTMP e SRT, montados a partir dos endereços de escuta do próprio servidor.

### Gravações

- Os MP4 de cada transmissão, agrupados por dia, com miniaturas automáticas.
- Um player que expande no lugar, navegável por requisições HTTP Range.
- Downloads em streaming, com progresso ao vivo e cancelamento.
- Aperte `/` para filtrar.

### Configuração, sem YAML

- **A configuração inteira do servidor** — 65 controles tipados e validados entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT.
- **Path defaults e overrides por path**, nos escopos de onde o MediaMTX os serve. Salvar uma transmissão coberta por wildcard grava uma entrada esparsa, então as chaves intocadas continuam herdando.
- **Os 15 hooks `runOn*`**, com aviso onde salvar reinicia o path.
- **Escritas esparsas** — só as chaves que você mudou.

### Operação

Um processo para API, SPA e mídia · multiarquitetura · `GET /health` · logs estruturados · PWA · claro e escuro · 30 idiomas · sem banco de dados.

## Variáveis de ambiente

Elas alimentam só o primeiro boot. O resto continua editável em **Config**.

| Variável | Padrão | Para que serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Onde o Connect alcança a API do MediaMTX de dentro do contêiner dele |
| `MEDIAMTX_API_PORT` | `9997` | Porta da API do MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Caminho do host montado para gravações (só no compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Onde ficam as miniaturas |

`http://mediamtx` só resolve na rede do compose incluído — para um `docker run` avulso, aponte para o seu host.

## Como funciona

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

A reprodução vai do navegador pro MediaMTX. O Connect só move JSON, mais as gravações e miniaturas que lê do disco.

## Documentação

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Todas as capacidades, rotas e procedimentos entregues |
| [Arquitetura](../../ARCHITECTURE.md) | Como as peças se encaixam |
| [Contribuindo](../../CONTRIBUTING.md) | Setup de dev, scripts, processo de PR |
| [Exemplos](../../examples/) | Câmera Raspberry Pi, transmissões falsas pra teste |

## Contribuindo

Issues e PRs são bem-vindos. `pnpm install && pnpm dev` te dá a stack completa com dados de exemplo — veja o [CONTRIBUTING.md](../../CONTRIBUTING.md), e lembre que títulos de PR são conventional commits. Seguimos um [Código de Conduta](../../CODE_OF_CONDUCT.md).

## Licença

[MIT](../../LICENSE)
