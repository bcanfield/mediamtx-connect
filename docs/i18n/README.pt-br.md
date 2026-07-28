<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A interface web do <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Assista às transmissões ao vivo, navegue pelas gravações e edite qualquer chave de configuração — direto do navegador.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — grade de transmissões ao vivo, navegador de gravações e editor de configuração" width="860">

</div>

## O que é

O MediaMTX é um ótimo servidor de streaming e vem sem interface. O Connect é o front-end que falta: um contêiner que conversa com a API do MediaMTX e a transforma em um painel de câmeras, um acervo de gravações e um editor de configuração.

É um companheiro, não um substituto. Cada tela se apoia em algo que o MediaMTX já expõe — um path, um endpoint da API, um hook `runOn*`, um protocolo que ele serve nativamente. O Connect não guarda vídeo, não faz proxy de mídia e não usa banco de dados. Aponte para um servidor rodando e pronto.

## Início rápido

As imagens são publicadas para `linux/amd64` e `linux/arm64` (Raspberry Pi, Apple Silicon e afins), então o Docker baixa a certa pra você.

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

De qualquer jeito, abra <http://localhost:3000>.

> [!IMPORTANT]
> O Connect precisa de `api: yes` no seu `mediamtx.yml` — é por essa API que ele lê e escreve tudo. A [configuração incluída](../../mediamtx.yml) é uma referência que funciona.

## O que você ganha

### Visão ao vivo

Uma grade com todos os path que o MediaMTX conhece, em 2, 3 ou 4 colunas.

- **WebRTC ou HLS, card a card.** `AUTO` prefere WebRTC e cai para HLS em silêncio, `LOW-LAT` exige WebRTC e `COMPAT` força HLS. Cada card negocia a própria conexão e informa o transporte que de fato conseguiu — nunca o que você pediu.
- **Snapshots mesmo parado.** Um job em segundo plano captura um quadro de cada transmissão, então cards inativos continuam mostrando a cena, com a idade do quadro na etiqueta. «Tirar snapshot» captura um na hora.
- **Telemetria ao vivo.** Chips de codec, número de espectadores e tempo no ar, tirados da própria lista de path — sem requisições extras.
- **Estado de gravação que fala a verdade.** Os cards mostram se a transmissão está gravando *de fato* (o override dela mesclado sobre os path defaults, do jeito que o MediaMTX resolve); um estado que não deu para ler aparece como desconhecido, não como desligado.
- **URLs de publicação na área de transferência.** Destinos RTSP, RTMP e SRT montados a partir dos endereços de escuta do próprio servidor, então uma porta trocada continua sendo a porta certa.

### Gravações

- Os MP4 de cada transmissão, agrupados por dia, do mais novo pro mais antigo, com miniaturas geradas automaticamente.
- Um player que expande no lugar, com barra de busca de verdade apoiada em requisições HTTP Range.
- Downloads em streaming com progresso ao vivo, velocidade e botão de cancelar.
- Aperte `/` em qualquer lugar para filtrar.

### Configuração, sem YAML

- **A configuração inteira do servidor** — 65 controles entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT, cada um tipado, validado e documentado no seu idioma.
- **Path defaults e overrides por path**, nos escopos de onde o MediaMTX realmente os serve. Salvar uma transmissão coberta por wildcard materializa uma entrada esparsa, então as chaves não tocadas seguem acompanhando os padrões — e «voltar ao herdado» desfaz.
- **Os 15 hooks de path `runOn*`**, com aviso onde salvar reinicia o path.
- **Escritas esparsas.** O Connect manda PATCH só das chaves que você mudou; o que ele não expõe fica intocado.

### Feito pra uma caixinha que você esquece

Um único processo servindo API, SPA e mídia · imagens multi-arquitetura · `GET /health` · logs estruturados · PWA instalável · temas claro e escuro · 30 idiomas · sem banco de dados.

## Variáveis de ambiente

Tudo aqui dá pra editar em tempo de execução em **Config** — essas variáveis só alimentam o primeiro boot.

| Variável | Padrão | Para que serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Onde o Connect alcança a API do MediaMTX de *dentro* do contêiner dele |
| `MEDIAMTX_API_PORT` | `9997` | Porta da API do MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Caminho do host montado para gravações (só no compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Onde ficam as miniaturas geradas |

O padrão `http://mediamtx` só resolve na rede do compose incluído. Para um `docker run` avulso, aponte para o seu host do MediaMTX — ou ajuste depois em **Config**, sem reiniciar nada.

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

A reprodução vai do navegador direto pro MediaMTX. O Connect só move JSON, mais as gravações e miniaturas que lê do disco.

## Documentação

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Todas as capacidades, rotas e procedimentos entregues |
| [Arquitetura](../../ARCHITECTURE.md) | Como as peças se encaixam |
| [Contribuindo](../../CONTRIBUTING.md) | Setup de dev, scripts, processo de PR |
| [Exemplos](../../examples/) | Câmera Raspberry Pi, transmissões falsas pra teste |

## Contribuindo

Issues e PRs são bem-vindos. `pnpm install && pnpm dev` te dá a stack completa com dados de exemplo — veja o [CONTRIBUTING.md](../../CONTRIBUTING.md) pro resto, e lembre que títulos de PR são [conventional commits](../../CONTRIBUTING.md). Este projeto segue um [Código de Conduta](../../CODE_OF_CONDUCT.md).

## Licença

[MIT](../../LICENSE)
