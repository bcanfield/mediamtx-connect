<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>A interface web do <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Veja transmissões em direto, percorra gravações e edite qualquer chave de configuração — a partir do browser.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — grelha de transmissões em direto, navegador de gravações e editor de configuração" width="860">

</div>

## O que é

O MediaMTX é um excelente servidor de streaming e vem sem interface. O Connect é o front-end que lhe falta: um contentor que fala com a API do MediaMTX e a transforma num mural de câmaras, num arquivo de gravações e num editor de configuração.

É um companheiro, não um substituto. Cada ecrã assenta em algo que o MediaMTX já expõe — um path, um endpoint da API, um hook `runOn*`, um protocolo que serve nativamente. O Connect não guarda vídeo, não faz proxy de media e não usa base de dados. Aponte-o a um servidor a correr e funciona.

## Arranque rápido

As imagens são publicadas para `linux/amd64` e `linux/arm64` (Raspberry Pi, Apple Silicon e afins), por isso o Docker descarrega a certa por si.

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

De qualquer das formas, abra <http://localhost:3000>.

> [!IMPORTANT]
> O Connect precisa de `api: yes` no seu `mediamtx.yml` — é por essa API que lê e escreve tudo. A [configuração incluída](../../mediamtx.yml) é uma referência funcional.

## O que recebe

### Vista em direto

Uma grelha com todos os path que o MediaMTX conhece, a 2, 3 ou 4 colunas.

- **WebRTC ou HLS, cartão a cartão.** `AUTO` prefere WebRTC e cai para HLS em silêncio, `LOW-LAT` insiste em WebRTC e `COMPAT` força HLS. Cada cartão negoceia a sua própria ligação e reporta o transporte que realmente obteve — nunca o que pediu.
- **Instantâneos enquanto está parado.** Uma tarefa em segundo plano capta um fotograma de cada transmissão, por isso os cartões inativos continuam a mostrar a cena, com a idade do fotograma na etiqueta. «Captar instantâneo» tira um na hora.
- **Telemetria ao vivo.** Chips de codec, número de espectadores e tempo online, retirados da própria lista de path — sem pedidos extra.
- **Estado de gravação que diz a verdade.** Os cartões mostram se uma transmissão está *efetivamente* a gravar (o override próprio fundido sobre os path defaults, tal como o MediaMTX o resolve); um estado que não foi possível ler aparece como desconhecido em vez de desligado.
- **URLs de publicação na área de transferência.** Destinos RTSP, RTMP e SRT construídos a partir dos endereços de escuta do próprio servidor, para que uma porta alterada continue a ser a porta certa.

### Gravações

- Os MP4 de cada transmissão, agrupados por dia, do mais recente para o mais antigo, com miniaturas geradas automaticamente.
- Um leitor que se expande no lugar, com uma barra de navegação real assente em pedidos HTTP Range.
- Descargas em streaming com progresso ao vivo, débito e botão de cancelar.
- Carregue em `/` em qualquer sítio para filtrar.

### Configuração, sem YAML

- **Toda a configuração do servidor** — 65 controlos entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC e SRT, cada um tipado, validado e documentado na sua língua.
- **Path defaults e overrides por path**, nos âmbitos de onde o MediaMTX os serve mesmo. Guardar uma transmissão coberta por wildcard materializa uma entrada esparsa, por isso as chaves não tocadas continuam a seguir os valores por omissão — e «reverter para herdado» desfaz.
- **Os 15 hooks de path `runOn*`**, com aviso onde guardar um reinicia o path.
- **Escritas esparsas.** O Connect faz PATCH apenas das chaves que alterou; o que não expõe fica intacto.

### Feito para uma caixa de que se esquece

Um único processo a servir API, SPA e media · imagens multi-arquitetura · `GET /health` · logs estruturados · PWA instalável · temas claro e escuro · 30 idiomas · sem base de dados.

## Variáveis de ambiente

Tudo isto é editável em tempo de execução em **Config** — estas variáveis só semeiam o primeiro arranque.

| Variável | Por omissão | Para que serve |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Onde o Connect alcança a API do MediaMTX a partir de *dentro* do seu contentor |
| `MEDIAMTX_API_PORT` | `9997` | Porta da API do MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Caminho do host montado para gravações (só compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Onde ficam as miniaturas geradas |

O valor por omissão `http://mediamtx` só resolve na rede do compose incluído. Para um `docker run` autónomo, aponte-o ao seu host MediaMTX — ou corrija depois em **Config**, sem reiniciar.

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

A reprodução vai do browser diretamente ao MediaMTX. O Connect só move JSON, mais as gravações e miniaturas que lê do disco.

## Documentação

| | |
|---|---|
| [Funcionalidades](../FEATURES.md) | Todas as capacidades, rotas e procedimentos lançados |
| [Arquitetura](../../ARCHITECTURE.md) | Como as peças encaixam |
| [Contribuir](../../CONTRIBUTING.md) | Ambiente de desenvolvimento, scripts, processo de PR |
| [Exemplos](../../examples/) | Câmara Raspberry Pi, transmissões falsas para testes |

## Contribuir

Issues e PR são bem-vindos. `pnpm install && pnpm dev` dá-lhe a stack completa com dados de exemplo — veja [CONTRIBUTING.md](../../CONTRIBUTING.md) para o resto, e note que os títulos de PR são [conventional commits](../../CONTRIBUTING.md). Este projeto segue um [Código de Conduta](../../CODE_OF_CONDUCT.md).

## Licença

[MIT](../../LICENSE)
