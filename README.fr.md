<div align="center">
  <h1>MediaMTX Connect</h1>
  <p><a href="./README.md">English</a> · <a href="./README.es.md">Español</a> · <a href="./README.zh.md">中文</a> · <a href="./README.it.md">Italiano</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ru.md">Русский</a> · <strong>Français</strong> · <a href="./README.pt.md">Português</a></p>
  <p>Une interface web pour <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>. Regardez vos flux, parcourez les enregistrements et modifiez la configuration depuis votre navigateur.</p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Démo de MediaMTX Connect" width="720">
</div>

## Comment l'exécuter

Vous utilisez déjà MediaMTX ? Installez Connect à ses côtés :

```bash
docker run -d \
  -p 3000:3000 \
  -v /chemin/vers/enregistrements:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Pas encore de MediaMTX ? Le compose fourni démarre les deux :

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Ouvrez http://localhost:3000, allez dans **Config** et pointez-le vers votre MediaMTX.

> Connect a besoin de `api: yes` dans votre `mediamtx.yml`. Voir [le fichier inclus](mediamtx.yml) comme référence fonctionnelle.

## Documentation

[Architecture](ARCHITECTURE.md) · [Fonctionnalités](docs/FEATURES.md) · [Contribuer](CONTRIBUTING.md)

> Note : la documentation pour les développeurs est maintenue uniquement en anglais. L'interface de l'application est disponible en français à l'adresse `/fr`.

## Licence

MIT
