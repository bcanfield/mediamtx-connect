<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interface web de <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Regardez les flux en direct, parcourez les enregistrements, modifiez n'importe quelle clé de configuration — depuis votre navigateur.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — grille des flux en direct, navigateur d'enregistrements et éditeur de configuration" width="860">

<details>
<summary>🌍 Lire en 30 langues</summary>
<p>
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
</details>

</div>

## Ce que c'est

MediaMTX est un excellent serveur de streaming sans interface. Connect est le front-end qui lui manque : un conteneur qui dialogue avec l'API de MediaMTX et la transforme en mur de caméras, en archive d'enregistrements et en éditeur de configuration.

C'est un compagnon, pas un remplaçant. Chaque écran s'appuie sur ce que MediaMTX expose déjà : un path, un endpoint, un hook `runOn*`, un protocole qu'il sert nativement. Aucune vidéo stockée, aucun média relayé, aucune base de données.

## Démarrage rapide

Images multi-arch (`linux/amd64`, `linux/arm64`) — Docker télécharge la bonne.

**MediaMTX tourne déjà ?** Ajoutez Connect à côté :

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Vous partez de rien ?** Le compose fourni démarre les deux :

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Ouvrez ensuite <http://localhost:3000>.

> [!IMPORTANT]
> Connect a besoin de `api: yes` dans votre `mediamtx.yml`. La [configuration fournie](../../mediamtx.yml) fonctionne telle quelle.

## Ce que vous obtenez

### Vue en direct

Tous les path connus de MediaMTX, en grille de 2 à 4 colonnes.

- **WebRTC ou HLS, carte par carte.** `AUTO` bascule sur HLS sans bruit, `LOW-LAT` exige WebRTC, `COMPAT` impose HLS — et chaque carte annonce le transport réellement obtenu.
- **Des captures même à l'arrêt.** Une tâche de fond garde une image récente sur chaque carte, avec son âge sur la pastille.
- **Télémétrie en direct.** Codecs, spectateurs et durée en ligne, issus de la liste des path.
- **Un état d'enregistrement honnête.** Les cartes indiquent si un flux enregistre *effectivement* ; un état que Connect n'a pas pu lire s'affiche comme inconnu, jamais comme désactivé.
- **URL de publication dans le presse-papiers.** RTSP, RTMP et SRT, construites à partir des adresses d'écoute du serveur lui-même.

### Enregistrements

- Les MP4 de chaque flux, groupés par jour, avec vignettes automatiques.
- Un lecteur qui se déplie sur place, navigable via des requêtes HTTP Range.
- Des téléchargements en flux, avec progression en direct et annulation.
- Appuyez sur `/` pour filtrer.

### La configuration, sans YAML

- **Toute la configuration du serveur** — 65 contrôles typés et validés répartis entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC et SRT.
- **Path defaults et overrides par path**, sur les portées d'où MediaMTX les sert. Enregistrer un flux couvert par un joker écrit une entrée creuse : les clés non touchées continuent d'hériter.
- **Les 15 hooks `runOn*`**, avec un avertissement là où enregistrer redémarre le path.
- **Écritures creuses** — seulement les clés modifiées.

### Exploitation

Un seul processus pour l'API, la SPA et les médias · multi-arch · `GET /health` · logs structurés · PWA · clair et sombre · 30 langues · aucune base de données.

## Variables d'environnement

Elles ne servent qu'au premier démarrage. Tout reste modifiable dans **Config**.

| Variable | Par défaut | Rôle |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Où Connect joint l'API de MediaMTX depuis l'intérieur de son conteneur |
| `MEDIAMTX_API_PORT` | `9997` | Port de l'API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Chemin hôte monté pour les enregistrements (compose uniquement) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Où sont rangées les vignettes |

`http://mediamtx` ne se résout que sur le réseau du compose fourni — pour un `docker run` autonome, pointez-le vers votre hôte.

## Comment ça marche

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

La lecture va du navigateur à MediaMTX. Connect ne déplace que du JSON, plus les enregistrements et vignettes qu'il lit sur le disque.

## Documentation

| | |
|---|---|
| [Fonctionnalités](../FEATURES.md) | Toutes les capacités, routes et procédures livrées |
| [Architecture](../../ARCHITECTURE.md) | Comment les pièces s'assemblent |
| [Contribuer](../../CONTRIBUTING.md) | Environnement de dev, scripts, processus de PR |
| [Exemples](../../examples/) | Caméra Raspberry Pi, faux flux pour les tests |

## Contribuer

Les issues et les PR sont bienvenues. `pnpm install && pnpm dev` vous donne la stack complète avec des données de test — voyez [CONTRIBUTING.md](../../CONTRIBUTING.md), et notez que les titres de PR sont des conventional commits. Nous suivons un [Code de Conduite](../../CODE_OF_CONDUCT.md).

## Licence

[MIT](../../LICENSE)
