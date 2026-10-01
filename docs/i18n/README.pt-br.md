<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A interface web do <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Assista às transmissões ao vivo, navegue pelas gravações e edite a configuração do seu MediaMTX direto do navegador.</p>

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

É um companheiro, não um substituto. Cada tela corresponde a algo que o MediaMTX já expõe: um path, um endpoint da API, um hook `runOn*`, um protocolo que ele serve nativamente. Não guarda vídeo, não faz proxy de mídia, não usa banco de dados.

## Início rápido

Imagens multiarquitetura (`linux/amd64`, `linux/arm64`); o Docker baixa a certa.

**Já tem o MediaMTX rodando?** Coloque o Connect do lado:

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

**Começando do zero?** O compose incluído compila o Connect e o roda ao lado do MediaMTX:

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

- **WebRTC ou HLS, card a card.** `AUTO` faz fallback em silêncio, `LOW-LAT` exige WebRTC, `COMPAT` força HLS. Cada card informa o transporte que de fato conseguiu.
- **Snapshots mesmo parado.** Um job em segundo plano mantém um quadro recente em cada card, com a idade dele na etiqueta. Precisa de um novo agora? Tire pelo menu do card.
- **Telemetria ao vivo.** Codecs, espectadores e tempo no ar, tirados da lista de path.
- **Estado de gravação honesto.** Os cards mostram se a transmissão está gravando *de fato*; um estado que o Connect não conseguiu ler aparece como desconhecido, nunca como desligado.
- **URLs de publicação na área de transferência.** RTSP, RTMP e SRT, montados a partir dos endereços de escuta do próprio servidor. A página de cada path vai além com um painel de publicação e leitura: todos os protocolos que o servidor serve, incluindo WHIP, WHEP, HLS e as variantes com TLS, com trechos prontos para copiar para ffmpeg, GStreamer, OBS, ffplay e VLC.

### Gravações

- Uma linha do tempo diária por transmissão, vinda do servidor de playback do MediaMTX: os trechos gravados e as lacunas entre eles, cada um reproduzível. Se o playback estiver desligado, o Connect lista exatamente as mudanças de configuração necessárias e as aplica com um clique.
- Download de clipes: qualquer intervalo de até uma hora (ou os últimos 5 min, 15 min ou uma hora) como um único MP4 simples, emendado entre segmentos pelo MediaMTX sem recodificação.
- Segmentos MP4 ou MPEG-TS por transmissão, agrupados por dia, com miniaturas geradas automaticamente.
- Um player embutido que expande no lugar, navegável por requisições HTTP de intervalo.
- Downloads em streaming, com progresso ao vivo e cancelamento.
- Aperte `/` para filtrar.

### Sessões

- **Todo mundo conectado, numa tabela só.** Publicadores e leitores via RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC e HLS, com endereço remoto, bytes de entrada e saída e tempo no ar, atualizados a cada 5 segundos.
- **Derrube um cliente** depois de confirmar. Ele pode se reconectar; derrubar não é banir.

### Configuração, sem YAML

- **A configuração do servidor:** 66 controles tipados e validados entre Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC e SRT.
- **Path defaults e overrides por path**, nos escopos de onde o MediaMTX os serve. Salvar uma transmissão coberta por wildcard grava uma entrada esparsa, então as chaves intocadas continuam acompanhando os defaults.
- **Um catálogo de path** com selos de ao vivo e regex, um formulário guiado "adicionar uma câmera RTSP" e opção de reverter ou excluir a entrada própria de qualquer path (com aviso se houver alguém conectado).
- **Saúde ao vivo na página de cada path:** tracks, leitores, bytes trafegados, quadros com erro e tempo no ar, atualizados a cada 5 segundos. Um path sem nada publicando aparece como ocioso, não como quebrado.
- **Resiliência em cada path:** um fallback sempre disponível que repete um clipe offline enquanto a câmera estiver fora do ar, e pull sob demanda, que só abre a fonte enquanto alguém está assistindo.
- **Todos os hooks `runOn*`**, com aviso onde salvar reinicia o path.
- **Encaminhamento:** envie um path para YouTube, Twitch ou outro servidor pela lista nativa `forward` do MediaMTX, com as chaves de stream mascaradas e sem reiniciar o path.
- **Escritas esparsas.** Só as chaves que você mudou são enviadas.

### Operação

Um processo para API, SPA e mídia · multiarquitetura · `GET /api/health` · versão do MediaMTX no cabeçalho · logs estruturados · instalável como PWA · claro e escuro · 30 idiomas · sem banco de dados.

## Variáveis de ambiente

Elas alimentam o primeiro boot. Tudo continua editável em **Config**.

| Variável | Padrão na imagem | Para que serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Onde o Connect alcança a API do MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Porta da API do MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Onde o *navegador* alcança o MediaMTX para reprodução. Defina sempre que o navegador não estiver no servidor |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Onde o Connect lê as gravações |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Onde ficam os snapshots e as miniaturas |
| `DATA_DIR` | `/data` | Onde fica o `config.json` |
| `PORT` | `3000` | Porta HTTP |
| `LOG_LEVEL` | `info` | Nível de log do Pino |

`http://mediamtx` só resolve na rede do compose incluído. Para um `docker run` avulso, aponte para o seu host. Com compose, defina `REMOTE_MEDIAMTX_HOST` no `.env` em vez de `REMOTE_MEDIAMTX_URL`: ela também define o host WebRTC que o MediaMTX anuncia. O [`.env.example`](../../.env.example) explica cada uma, e o `pnpm dev` usa padrões de localhost sem nenhum `.env`.

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

A reprodução ao vivo vai do navegador direto pro MediaMTX. O Connect move JSON, mais as gravações e miniaturas: lidas do disco, ou trechos gravados repassados via proxy do servidor de playback do MediaMTX.

## Documentação

| | |
|---|---|
| [Funcionalidades](../../docs/FEATURES.md) | Todas as capacidades, rotas e procedimentos entregues |
| [Arquitetura](../../docs/ARCHITECTURE.md) | Como as peças se encaixam |
| [Contribuindo](../../CONTRIBUTING.md) | Setup de dev, scripts, processo de PR |
| [Exemplos](../../examples/) | Câmera Raspberry Pi, transmissões falsas pra teste |

## Contribuindo

Issues e PRs são bem-vindos. `pnpm install && pnpm dev` te dá a stack completa com dados de exemplo. Veja o [CONTRIBUTING.md](../../CONTRIBUTING.md), e lembre que títulos de PR são conventional commits. Seguimos um [Código de Conduta](../../CODE_OF_CONDUCT.md).

## Licença

[MIT](../../LICENSE)
