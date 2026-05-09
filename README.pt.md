<div align="center">
  <h1>MediaMTX Connect</h1>
  <p>🌐 <a href="./README.md">English</a> · <a href="./README.es.md">Español</a> · <a href="./README.zh.md">中文</a> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.fr.md">Français</a> · <strong>Português</strong> · <a href="./README.ja.md">日本語</a> · <a href="./README.pl.md">Polski</a></p>
  <p>Uma interface web para o <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Vê transmissões, navega pelas gravações e edita a configuração no navegador.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Demonstração do MediaMTX Connect" width="720">
</div>

## Como executar

Já tens o MediaMTX a correr? Coloca o Connect ao lado dele:

```bash
docker run -d \
  -p 3000:3000 \
  -v /caminho/para/gravacoes:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Ainda não tens MediaMTX? O compose incluído inicia ambos:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Abre http://localhost:3000, vai a **Config** e aponta-o para o teu MediaMTX.

> O Connect requer `api: yes` no teu `mediamtx.yml`. Vê [o ficheiro incluído](mediamtx.yml) como referência funcional.

## Documentação

[Arquitetura](ARCHITECTURE.md) · [Funcionalidades](docs/FEATURES.md) · [Contribuir](CONTRIBUTING.md)

> Nota: a documentação para programadores é mantida apenas em inglês. A interface da aplicação está disponível em português em `/pt`.

## Licença

MIT
