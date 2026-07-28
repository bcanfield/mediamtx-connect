<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A interface web do <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Veja transmissões em direto, percorra gravações, edite qualquer chave de configuração — a partir do browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grelha de transmissões em direto, navegador de gravações e editor de configuração" width="860">

<details>
<summary>🌍 Ler em 30 idiomas</summary>
<p>
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <a href="./README.fr.md">Français</a> •
  🇵🇹 <strong>Português</strong> •
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
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>
</details>

</div>

## O que é

O MediaMTX é um excelente servidor de streaming sem interface. O Connect é o front-end que lhe falta: um contentor que fala com a API do MediaMTX e a transforma num mural de câmaras, num arquivo de gravações e num editor de configuração.

É um companheiro, não um substituto. Cada ecrã assenta em algo que o MediaMTX já expõe: um path, um endpoint, um hook `runOn*`, um protocolo que serve nativamente. Não guarda vídeo, não faz proxy de media, não usa base de dados.

## Arranque rápido

Imagens multiarquitetura (`linux/amd64`, `linux/arm64`) — o Docker descarrega a certa.

**Já tem o MediaMTX a correr?** Coloque o Connect ao lado:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**A começar do zero?** O compose incluído levanta os dois:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Depois abra <http://localhost:3000>.

> [!IMPORTANT]
> O Connect precisa de `api: yes` no seu `mediamtx.yml`. A [configuração incluída](../../mediamtx.yml) funciona tal como está.

## O que recebe

### Vista em direto

Todos os path que o MediaMTX conhece, numa grelha de 2 a 4 colunas.

- **WebRTC ou HLS, cartão a cartão.** `AUTO` cai para HLS em silêncio, `LOW-LAT` insiste em WebRTC, `COMPAT` força HLS — e cada cartão reporta o transporte que realmente obteve.
- **Instantâneos enquanto está parado.** Uma tarefa em segundo plano mantém um fotograma recente em cada cartão, com a idade na etiqueta.
- **Telemetria ao vivo.** Codecs, espectadores e tempo online, retirados da lista de path.
- **Estado de gravação honesto.** Os cartões mostram se uma transmissão está *efetivamente* a gravar; um estado que o Connect não conseguiu ler diz desconhecido, nunca desligado.
- **URLs de publicação na área de transferência.** RTSP, RTMP e SRT, construídos a partir dos endereços de escuta do próprio servidor.

### Gravações

- Os MP4 de cada transmissão, agrupados por dia, com miniaturas automáticas.
- Um leitor que se expande no lugar, navegável através de pedidos HTTP Range.
- Descargas em streaming, com progresso ao vivo e cancelamento.
- Carregue em `/` para filtrar.

### Configuração, sem YAML

- **Toda a configuração do servidor** — 65 controlos tipados e validados entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT.
- **Path defaults e overrides por path**, nos âmbitos de onde o MediaMTX os serve. Guardar uma transmissão coberta por wildcard escreve uma entrada esparsa, por isso as chaves intactas continuam a herdar.
- **Os 15 hooks `runOn*`**, com aviso onde guardar reinicia o path.
- **Escritas esparsas** — apenas as chaves que alterou.

### Operação

Um processo para API, SPA e media · multiarquitetura · `GET /health` · logs estruturados · PWA · claro e escuro · 30 idiomas · sem base de dados.

## Variáveis de ambiente

Semeiam apenas o primeiro arranque. Tudo continua editável em **Config**.

| Variável | Por omissão | Para que serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Onde o Connect alcança a API do MediaMTX de dentro do seu contentor |
| `MEDIAMTX_API_PORT` | `9997` | Porta da API do MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Caminho do host montado para gravações (só compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Onde ficam as miniaturas |

`http://mediamtx` só resolve na rede do compose incluído — para um `docker run` autónomo, aponte-o ao seu host.

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

A reprodução vai do browser ao MediaMTX. O Connect só move JSON, mais as gravações e miniaturas que lê do disco.

## Documentação

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Todas as capacidades, rotas e procedimentos lançados |
| [Arquitetura](../../ARCHITECTURE.md) | Como as peças encaixam |
| [Contribuir](../../CONTRIBUTING.md) | Ambiente de desenvolvimento, scripts, processo de PR |
| [Exemplos](../../examples/) | Câmara Raspberry Pi, transmissões falsas para testes |

## Contribuir

Issues e PR são bem-vindos. `pnpm install && pnpm dev` dá-lhe a stack completa com dados de exemplo — veja [CONTRIBUTING.md](../../CONTRIBUTING.md), e note que os títulos de PR são conventional commits. Seguimos um [Código de Conduta](../../CODE_OF_CONDUCT.md).

## Licença

[MIT](../../LICENSE)
