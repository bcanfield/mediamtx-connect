<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>L'interface web de <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Regardez les flux en direct, parcourez les enregistrements et modifiez votre configuration MediaMTX depuis le navigateur.</p>

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

C'est un compagnon, pas un remplaçant. Chaque écran correspond à quelque chose que MediaMTX expose déjà : un path, un endpoint d'API, un hook `runOn*`, un protocole qu'il sert nativement. Aucune vidéo stockée, aucun média relayé, aucune base de données.

## Démarrage rapide

Images multi-arch (`linux/amd64`, `linux/arm64`) ; Docker télécharge la bonne.

**MediaMTX tourne déjà ?** Ajoutez Connect à côté :

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

**Vous partez de rien ?** Le compose fourni construit Connect et le lance à côté de MediaMTX :

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

- **WebRTC ou HLS, carte par carte.** `AUTO` bascule sans bruit, `LOW-LAT` exige WebRTC, `COMPAT` impose HLS. Chaque carte annonce le transport réellement obtenu.
- **Des captures même à l'arrêt.** Une tâche de fond garde une image récente sur chaque carte, avec son âge sur la pastille. Besoin d'une image fraîche tout de suite ? Prenez-la depuis le menu de la carte.
- **Télémétrie en direct.** Codecs, nombre de spectateurs et durée en ligne, issus directement de la liste des path.
- **Un état d'enregistrement honnête.** Les cartes indiquent si un flux enregistre *effectivement* ; un état que Connect n'a pas pu lire s'affiche comme inconnu, jamais comme désactivé.
- **URL de publication dans le presse-papiers.** RTSP, RTMP et SRT, construites à partir des adresses d'écoute du serveur lui-même. La page de chaque path va plus loin avec un panneau de publication et de lecture : tous les protocoles que sert le serveur, y compris WHIP, WHEP, HLS et les variantes TLS, avec des extraits ffmpeg, GStreamer, OBS, ffplay et VLC prêts à copier.

### Enregistrements

- Une frise journalière par flux, issue du serveur de lecture de MediaMTX : les plages enregistrées et les trous entre elles, chacune lisible. Si la lecture est désactivée, Connect liste les changements de configuration exacts dont elle a besoin et les applique en un clic.
- Téléchargement d'extraits : n'importe quelle plage jusqu'à une heure (ou les 5 dernières minutes, 15 minutes ou la dernière heure) en un seul MP4 simple, assemblé à travers les segments par MediaMTX sans réencodage.
- Des segments MP4 ou MPEG-TS par flux, groupés par jour, avec vignettes générées automatiquement.
- Un lecteur intégré qui se déplie sur place, navigable via des requêtes HTTP Range.
- Des téléchargements en flux, avec progression en direct et annulation.
- Appuyez sur `/` pour filtrer.

### Sessions

- **Tous les connectés, dans un seul tableau.** Éditeurs et lecteurs en RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC et HLS, avec adresse distante, octets entrants et sortants, et durée de connexion, rafraîchis toutes les 5 secondes.
- **Expulsez un client** après confirmation. Il peut se reconnecter ; une expulsion n'est pas un bannissement.

### La configuration, sans YAML

- **La configuration du serveur :** 66 contrôles typés et validés répartis entre Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC et SRT.
- **Path defaults et overrides par path**, sur les portées d'où MediaMTX les sert. Enregistrer un flux couvert par un joker écrit une entrée creuse : les clés non touchées continuent de suivre les valeurs par défaut.
- **Un catalogue des path** avec badges en direct et regex, un formulaire guidé « ajouter une caméra RTSP », et l'annulation ou la suppression de l'entrée propre à n'importe quel path (avec un avertissement si quelqu'un est connecté).
- **L'état en direct sur la page de chaque path :** pistes, lecteurs, octets transférés, images en erreur et durée en ligne, rafraîchis toutes les 5 secondes. Un path sur lequel rien n'est publié apparaît inactif, pas en panne.
- **De la résilience sur chaque path :** un fallback toujours disponible qui boucle un clip hors ligne pendant que la caméra est en panne, et une récupération à la demande qui n'ouvre la source que lorsque quelqu'un regarde.
- **Chaque hook `runOn*`**, avec un avertissement là où enregistrer redémarre le path.
- **Retransmission :** poussez un path vers YouTube, Twitch ou un autre serveur via la liste native `forward` de MediaMTX, avec les clés de stream masquées et sans redémarrage du path.
- **Écritures creuses.** Seules les clés que vous avez modifiées sont envoyées.

### Exploitation

Un seul processus pour l'API, la SPA et les médias · multi-arch · `GET /api/health` · version de MediaMTX dans l'en-tête · logs structurés · installable en PWA · sombre et clair · 30 langues · aucune base de données.

## Variables d'environnement

Elles ne servent qu'au premier démarrage. Tout reste modifiable dans **Config**.

| Variable | Valeur par défaut dans l'image | Rôle |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Où Connect joint l'API de MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Port de l'API MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Où le *navigateur* joint MediaMTX pour la lecture. À définir dès que le navigateur n'est pas sur le serveur |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Où Connect lit les enregistrements |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Où vont les captures et les vignettes |
| `DATA_DIR` | `/data` | Où se trouve `config.json` |
| `PORT` | `3000` | Port HTTP |
| `LOG_LEVEL` | `info` | Niveau de log Pino |

`http://mediamtx` ne se résout que sur le réseau du compose fourni. Pour un `docker run` autonome, pointez-le vers votre hôte. Avec compose, définissez `REMOTE_MEDIAMTX_HOST` dans `.env` au lieu de `REMOTE_MEDIAMTX_URL` : cela règle aussi l'hôte WebRTC que MediaMTX annonce. [`.env.example`](../../.env.example) explique chacune d'elles, et `pnpm dev` utilise des valeurs par défaut sur localhost sans aucun `.env`.

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

La lecture en direct va du navigateur à MediaMTX. Connect déplace du JSON, plus les enregistrements et les vignettes : depuis le disque, ou des plages enregistrées relayées depuis le serveur de lecture de MediaMTX.

## Documentation

| | |
|---|---|
| [Fonctionnalités](../../docs/FEATURES.md) | Toutes les capacités, routes et procédures livrées |
| [Architecture](../../docs/ARCHITECTURE.md) | Comment les pièces s'assemblent |
| [Contribuer](../../CONTRIBUTING.md) | Environnement de dev, scripts, processus de PR |
| [Exemples](../../examples/) | Caméra Raspberry Pi, faux flux pour les tests |

## Contribuer

Les issues et les PR sont bienvenues. `pnpm install && pnpm dev` vous donne la stack complète avec des données de test. Voyez [CONTRIBUTING.md](../../CONTRIBUTING.md), et notez que les titres de PR sont des conventional commits. Nous suivons un [Code de Conduite](../../CODE_OF_CONDUCT.md).

## Licence

[MIT](../../LICENSE)
