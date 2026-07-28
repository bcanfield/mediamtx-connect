<h1 align="center">
  <br>
  MediaMTX Connect
  <br>
</h1>

<p align="center">
  🇺🇸 <a href="../../README.md">English</a> •
  🇪🇸 <a href="./README.es.md">Español</a> •
  🇨🇳 <a href="./README.zh.md">中文</a> •
  🇮🇹 <a href="./README.it.md">Italiano</a> •
  🇩🇪 <a href="./README.de.md">Deutsch</a> •
  🇷🇺 <a href="./README.ru.md">Русский</a> •
  🇫🇷 <strong>Français</strong> •
  🇵🇹 <a href="./README.pt.md">Português</a> •
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

<h4 align="center">Une interface web pour <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Regardez vos flux, parcourez les enregistrements et modifiez la configuration depuis votre navigateur.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Démo de MediaMTX Connect" width="720">
</p>

## Comment l'exécuter

Les images sont publiées à la fois pour `linux/amd64` et `linux/arm64` (Raspberry Pi, Apple Silicon, etc.) — Docker télécharge automatiquement la bonne.

Vous utilisez déjà MediaMTX ? Installez Connect à ses côtés :

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /chemin/vers/enregistrements:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

`BACKEND_SERVER_MEDIAMTX_URL` est l'adresse à laquelle Connect joint l'API de MediaMTX depuis *l'intérieur* de son conteneur. Sa valeur par défaut est `http://mediamtx`, qui ne se résout que sur le réseau compose fourni — pour un `docker run` autonome, indiquez l'hôte de votre MediaMTX (vous pourrez aussi le modifier plus tard dans **Config**).

Pas encore de MediaMTX ? Le compose fourni démarre les deux :

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Ouvrez http://localhost:3000, allez dans **Config** et pointez-le vers votre MediaMTX.

> Connect a besoin de `api: yes` dans votre `mediamtx.yml`. Voir [le fichier inclus](../../mediamtx.yml) comme référence fonctionnelle.

### Configuration

Tout est configurable à l'exécution dans **Config**. Ces variables d'environnement ne servent qu'à amorcer le premier démarrage :

| Variable | Valeur par défaut | Rôle |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Hôte de l'API MediaMTX, joignable depuis le conteneur de Connect |
| `MEDIAMTX_API_PORT` | `9997` | Port de l'API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Chemin hôte monté pour les enregistrements (compose uniquement ; facultatif — valeur par défaut si non défini) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Emplacement de stockage des captures d'écran générées |

## Documentation

[Architecture](../../ARCHITECTURE.md) · [Fonctionnalités](../../docs/FEATURES.md) · [Contribuer](../../CONTRIBUTING.md)

> Note : la documentation pour les développeurs est maintenue uniquement en anglais. L'interface de l'application est disponible en français à l'adresse `/fr`.

## Code de conduite

Ce projet suit un [Code de conduite](../../CODE_OF_CONDUCT.md). En y participant, vous vous engagez à le respecter.

## Licence

MIT
