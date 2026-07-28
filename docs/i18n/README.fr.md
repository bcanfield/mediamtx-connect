<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interface web de <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Regardez les flux en direct, parcourez les enregistrements et modifiez n'importe quelle clé de configuration — depuis votre navigateur.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — grille des flux en direct, navigateur d'enregistrements et éditeur de configuration" width="860">

</div>

## Ce que c'est

MediaMTX est un excellent serveur de streaming, et il est livré sans interface. Connect est le front-end qui lui manque : un conteneur qui dialogue avec l'API de MediaMTX et la transforme en mur de caméras, en archive d'enregistrements et en éditeur de configuration.

C'est un compagnon, pas un remplaçant. Chaque écran s'appuie sur ce que MediaMTX expose déjà — un path, un endpoint d'API, un hook `runOn*`, un protocole qu'il sert nativement. Connect ne stocke aucune vidéo, ne relaie aucun média et n'a pas de base de données. Pointez-le vers un serveur en marche, et ça tourne.

## Démarrage rapide

Les images sont publiées pour `linux/amd64` et `linux/arm64` (Raspberry Pi, Apple Silicon et consorts) : Docker télécharge la bonne pour vous.

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

Dans les deux cas, ouvrez <http://localhost:3000>.

> [!IMPORTANT]
> Connect a besoin de `api: yes` dans votre `mediamtx.yml` — c'est par cette API qu'il lit et écrit tout. La [configuration fournie](../../mediamtx.yml) sert de référence fonctionnelle.

## Ce que vous obtenez

### Vue en direct

Une grille de tous les path connus de MediaMTX, sur 2, 3 ou 4 colonnes.

- **WebRTC ou HLS, carte par carte.** `AUTO` privilégie WebRTC et bascule sur HLS sans bruit, `LOW-LAT` exige WebRTC, `COMPAT` impose HLS. Chaque carte négocie sa propre connexion et annonce le transport réellement obtenu — jamais celui que vous avez demandé.
- **Des captures même à l'arrêt.** Une tâche de fond prend une image de chaque flux, si bien qu'une carte inactive montre quand même la scène, avec l'âge de l'image sur la pastille. « Prendre une capture » en récupère une immédiatement.
- **Télémétrie en direct.** Puces de codecs, nombre de spectateurs et durée en ligne, directement issus de la liste des path — sans requête supplémentaire.
- **Un état d'enregistrement qui dit vrai.** Les cartes indiquent si un flux enregistre *effectivement* (son propre override fusionné par-dessus les path defaults, comme MediaMTX le résout) ; un état illisible s'affiche comme inconnu plutôt que comme désactivé.
- **URL de publication dans le presse-papiers.** Cibles RTSP, RTMP et SRT construites à partir des adresses d'écoute du serveur lui-même : un port modifié reste le bon port.

### Enregistrements

- Les MP4 de chaque flux, groupés par jour, du plus récent au plus ancien, avec des vignettes générées automatiquement.
- Un lecteur qui se déplie sur place, avec une vraie barre de lecture reposant sur des requêtes HTTP Range.
- Des téléchargements en flux, avec progression en direct, débit et bouton d'annulation.
- Appuyez sur `/` n'importe où pour filtrer.

### La configuration, sans YAML

- **Toute la configuration du serveur** — 65 contrôles répartis entre Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC et SRT, chacun typé, validé et documenté dans votre langue.
- **Path defaults et overrides par path**, sur les portées d'où MediaMTX les sert réellement. Enregistrer un flux couvert par un joker matérialise une entrée creuse : les clés non touchées continuent de suivre les valeurs par défaut — et « revenir à l'héritage » annule l'opération.
- **Les 15 hooks de path `runOn*`**, avec un avertissement là où enregistrer redémarre le path.
- **Écritures creuses.** Connect n'envoie en PATCH que les clés modifiées ; ce qu'il n'expose pas reste intact.

### Conçu pour une machine qu'on oublie

Un seul processus pour l'API, la SPA et les médias · images multi-arch · `GET /health` · logs structurés · PWA installable · thèmes clair et sombre · 30 langues · aucune base de données.

## Variables d'environnement

Tout ceci se modifie à chaud dans **Config** — ces variables ne servent qu'au tout premier démarrage.

| Variable | Par défaut | Rôle |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Où Connect joint l'API de MediaMTX depuis l'*intérieur* de son conteneur |
| `MEDIAMTX_API_PORT` | `9997` | Port de l'API MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Chemin hôte monté pour les enregistrements (compose uniquement) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Où sont rangées les vignettes générées |

La valeur par défaut `http://mediamtx` ne se résout que sur le réseau du compose fourni. Pour un `docker run` autonome, indiquez votre hôte MediaMTX — ou corrigez-le plus tard dans **Config**, sans redémarrage.

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

La lecture va du navigateur à MediaMTX en direct. Connect ne déplace que du JSON, plus les enregistrements et vignettes qu'il lit sur le disque.

## Documentation

| | |
|---|---|
| [Fonctionnalités](../FEATURES.md) | Toutes les capacités, routes et procédures livrées |
| [Architecture](../../ARCHITECTURE.md) | Comment les pièces s'assemblent |
| [Contribuer](../../CONTRIBUTING.md) | Environnement de dev, scripts, processus de PR |
| [Exemples](../../examples/) | Caméra Raspberry Pi, faux flux pour les tests |

## Contribuer

Les issues et les PR sont les bienvenues. `pnpm install && pnpm dev` vous donne la stack complète avec des données de test — voyez [CONTRIBUTING.md](../../CONTRIBUTING.md) pour le reste, et notez que les titres de PR sont des [conventional commits](../../CONTRIBUTING.md). Ce projet suit un [Code de Conduite](../../CODE_OF_CONDUCT.md).

## Licence

[MIT](../../LICENSE)
