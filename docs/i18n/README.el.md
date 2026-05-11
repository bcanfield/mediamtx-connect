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
  🇫🇷 <a href="./README.fr.md">Français</a> •
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
  🇬🇷 <strong>Ελληνικά</strong> •
  🇭🇺 <a href="./README.hu.md">Magyar</a> •
  🇺🇦 <a href="./README.uk.md">Українська</a> •
  🇻🇳 <a href="./README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./README.th.md">ไทย</a> •
  🇮🇳 <a href="./README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./README.bn.md">বাংলা</a>
</p>

<h4 align="center">Διαδικτυακή διεπαφή για το <a href="https://github.com/bluenviron/mediamtx" target="_blank">MediaMTX</a>. Παρακολουθήστε ροές, περιηγηθείτε σε εγγραφές και επεξεργαστείτε τις ρυθμίσεις από τον περιηγητή σας.</h4>

<p align="center">
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
  <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
</p>

<p align="center">
  <img src="../../.github/assets/demo.gif" alt="Επίδειξη του MediaMTX Connect" width="720">
</p>

## Πώς να το εκτελέσετε

Ήδη εκτελείτε το MediaMTX; Προσθέστε το Connect δίπλα του:

```bash
docker run -d \
  -p 3000:3000 \
  -v /diadromi/pros/eggrafes:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Δεν έχετε ακόμα MediaMTX; Το συμπεριλαμβανόμενο compose ξεκινά και τα δύο:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Ανοίξτε το http://localhost:3000, πηγαίνετε στο **Config**, και κατευθύνετέ το προς το MediaMTX σας.

> Το Connect χρειάζεται `api: yes` στο `mediamtx.yml`. Δείτε [το συμπεριλαμβανόμενο αρχείο](../../mediamtx.yml) ως λειτουργικό παράδειγμα.

## Τεκμηρίωση

[Αρχιτεκτονική](../../ARCHITECTURE.md) · [Χαρακτηριστικά](../../docs/FEATURES.md) · [Συνεισφορά](../../CONTRIBUTING.md)

> Σημείωση: η τεκμηρίωση για προγραμματιστές διατηρείται μόνο στα αγγλικά. Η διεπαφή της εφαρμογής είναι διαθέσιμη στα ελληνικά στο `/el`.

## Άδεια

MIT
