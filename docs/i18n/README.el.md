<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Το web περιβάλλον για το <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Δείτε ζωντανές ροές, περιηγηθείτε στις εγγραφές και επεξεργαστείτε κάθε κλειδί ρυθμίσεων — από τον browser σας.</p>

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

<img src="../../.github/assets/demo.gif" alt="MediaMTX Connect — πλέγμα ζωντανών ροών, περιηγητής εγγραφών και επεξεργαστής ρυθμίσεων" width="860">

</div>

## Τι είναι

Το MediaMTX είναι εξαιρετικός streaming server και έρχεται χωρίς περιβάλλον χρήσης. Το Connect είναι το front-end που του λείπει: ένα container που μιλά με το API του MediaMTX και το μετατρέπει σε τοίχο καμερών, αρχείο εγγραφών και επεξεργαστή ρυθμίσεων.

Είναι συνοδοιπόρος, όχι αντικαταστάτης. Κάθε οθόνη πατά σε κάτι που το MediaMTX ήδη εκθέτει — ένα path, ένα endpoint του API, ένα hook `runOn*`, ένα πρωτόκολλο που σερβίρει το ίδιο. Το Connect δεν αποθηκεύει βίντεο, δεν κάνει proxy σε μέσα και δεν κρατά βάση δεδομένων. Στρέψτε το σε έναν server που τρέχει και δουλεύει.

## Γρήγορη εκκίνηση

Τα images δημοσιεύονται για `linux/amd64` και `linux/arm64` (Raspberry Pi, Apple Silicon και συναφή), οπότε το Docker κατεβάζει το σωστό για εσάς.

**Τρέχει ήδη MediaMTX;** Βάλτε το Connect δίπλα του:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Ξεκινάτε από το μηδέν;** Το compose που περιλαμβάνεται σηκώνει και τα δύο:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Σε κάθε περίπτωση, ανοίξτε το <http://localhost:3000>.

> [!IMPORTANT]
> Το Connect χρειάζεται `api: yes` στο `mediamtx.yml` σας — μέσα από αυτό το API διαβάζει και γράφει τα πάντα. Η [συμπεριλαμβανόμενη ρύθμιση](../../mediamtx.yml) είναι ένα λειτουργικό παράδειγμα.

## Τι κερδίζετε

### Ζωντανή προβολή

Ένα πλέγμα με κάθε path που γνωρίζει το MediaMTX, σε 2, 3 ή 4 στήλες.

- **WebRTC ή HLS, ανά κάρτα.** Το `AUTO` προτιμά WebRTC και πέφτει σιωπηλά σε HLS, το `LOW-LAT` επιμένει σε WebRTC και το `COMPAT` επιβάλλει HLS. Κάθε κάρτα διαπραγματεύεται τη δική της σύνδεση και αναφέρει τη μεταφορά που όντως πέτυχε — ποτέ αυτήν που ζητήσατε.
- **Στιγμιότυπα και σε αδράνεια.** Μια εργασία παρασκηνίου τραβά ένα καρέ από κάθε ροή, ώστε οι ανενεργές κάρτες να δείχνουν κι έτσι τη σκηνή, με την ηλικία του καρέ πάνω στην ετικέτα. Το «Λήψη στιγμιότυπου» τραβά ένα αμέσως.
- **Ζωντανή τηλεμετρία.** Ετικέτες codec, αριθμός θεατών και χρόνος λειτουργίας, κατευθείαν από τη λίστα των path — χωρίς επιπλέον αιτήματα.
- **Κατάσταση εγγραφής που λέει την αλήθεια.** Οι κάρτες δείχνουν αν μια ροή γράφει *πραγματικά* (η δική της παράκαμψη πάνω από τα path defaults, όπως ακριβώς το επιλύει το MediaMTX)· μια κατάσταση που δεν διαβάστηκε εμφανίζεται ως άγνωστη και όχι ως ανενεργή.
- **URL δημοσίευσης στο πρόχειρο.** Οι προορισμοί RTSP, RTMP και SRT χτίζονται από τις ίδιες τις διευθύνσεις ακρόασης του server, ώστε μια αλλαγμένη θύρα να παραμένει η σωστή θύρα.

### Εγγραφές

- Τα MP4 κάθε ροής, ομαδοποιημένα ανά ημέρα, με τα νεότερα πρώτα και αυτόματα παραγόμενες μικρογραφίες.
- Ένα player που ξεδιπλώνεται επιτόπου, με πραγματική μπάρα αναζήτησης πάνω σε αιτήματα HTTP Range.
- Λήψεις που ρέουν, με ζωντανή πρόοδο, ταχύτητα και κουμπί ακύρωσης.
- Πατήστε `/` οπουδήποτε για φιλτράρισμα.

### Ρυθμίσεις, χωρίς YAML

- **Ολόκληρη η ρύθμιση του server** — 65 χειριστήρια σε Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC και SRT, το καθένα με τύπο, επικύρωση και τεκμηρίωση στη γλώσσα σας.
- **Path defaults και παρακάμψεις ανά path**, στα εύρη από τα οποία τα σερβίρει πράγματι το MediaMTX. Η αποθήκευση μιας ροής που καλύπτεται από wildcard υλοποιεί μια αραιή εγγραφή, οπότε τα κλειδιά που δεν αγγίξατε συνεχίζουν να ακολουθούν τις προεπιλογές — και η «επαναφορά σε κληρονομημένο» το αναιρεί.
- **Και τα 15 path hooks `runOn*`**, με προειδοποίηση εκεί όπου η αποθήκευση επανεκκινεί το path.
- **Αραιές εγγραφές.** Το Connect κάνει PATCH μόνο στα κλειδιά που αλλάξατε· ό,τι δεν εκθέτει μένει ανέγγιχτο.

### Φτιαγμένο για ένα κουτί που ξεχνάς

Μία διεργασία σερβίρει API, SPA και μέσα · images πολλαπλών αρχιτεκτονικών · `GET /health` · δομημένα logs · εγκαταστάσιμη PWA · φωτεινό και σκοτεινό θέμα · 30 γλώσσες · καμία βάση δεδομένων.

## Μεταβλητές περιβάλλοντος

Όλα εδώ αλλάζουν εν ώρα λειτουργίας από το **Config** — αυτές οι μεταβλητές απλώς σπέρνουν την πρώτη εκκίνηση.

| Μεταβλητή | Προεπιλογή | Σκοπός |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Πού φτάνει το Connect το API του MediaMTX από *μέσα* από το container του |
| `MEDIAMTX_API_PORT` | `9997` | Θύρα του API του MediaMTX |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Διαδρομή host προσαρτημένη για εγγραφές (μόνο compose) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Πού αποθηκεύονται οι μικρογραφίες που παράγονται |

Η προεπιλογή `http://mediamtx` επιλύεται μόνο στο δίκτυο του compose που περιλαμβάνεται. Για αυτόνομο `docker run`, βάλτε τον δικό σας host MediaMTX — ή διορθώστε το αργότερα από το **Config**, χωρίς επανεκκίνηση.

## Πώς λειτουργεί

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

Η αναπαραγωγή πάει από τον browser κατευθείαν στο MediaMTX. Το Connect μετακινεί μόνο JSON, συν τις εγγραφές και τις μικρογραφίες που διαβάζει από τον δίσκο.

## Τεκμηρίωση

| | |
|---|---|
| [Δυνατότητες](../FEATURES.md) | Κάθε δυνατότητα, διαδρομή και διαδικασία που έχει κυκλοφορήσει |
| [Αρχιτεκτονική](../../ARCHITECTURE.md) | Πώς δένουν τα κομμάτια |
| [Συνεισφορά](../../CONTRIBUTING.md) | Στήσιμο ανάπτυξης, scripts, διαδικασία PR |
| [Παραδείγματα](../../examples/) | Κάμερα Raspberry Pi, πλαστές ροές για δοκιμές |

## Συνεισφορά

Τα issues και τα PR είναι ευπρόσδεκτα. Το `pnpm install && pnpm dev` σας δίνει ολόκληρο το stack με δοκιμαστικά δεδομένα — δείτε το [CONTRIBUTING.md](../../CONTRIBUTING.md) για τα υπόλοιπα, και σημειώστε ότι οι τίτλοι των PR είναι [conventional commits](../../CONTRIBUTING.md). Το έργο ακολουθεί έναν [Κώδικα Δεοντολογίας](../../CODE_OF_CONDUCT.md).

## Άδεια

[MIT](../../LICENSE)
