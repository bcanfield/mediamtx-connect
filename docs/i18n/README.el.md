<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>Το web περιβάλλον για το <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Δείτε ζωντανές ροές, περιηγηθείτε στις εγγραφές και επεξεργαστείτε τις ρυθμίσεις του MediaMTX από τον browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src="../../.github/assets/demo.png" alt="MediaMTX Connect — πλέγμα ζωντανών ροών, περιηγητής εγγραφών και επεξεργαστής ρυθμίσεων" width="860">

<details>
<summary>🌍 Διαβάστε το σε 30 γλώσσες</summary>
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
</details>

</div>

## Τι είναι

Το MediaMTX είναι εξαιρετικός streaming server χωρίς περιβάλλον χρήσης. Το Connect είναι το front-end που του λείπει: ένα container που μιλά με το API του MediaMTX και το μετατρέπει σε τοίχο καμερών, αρχείο εγγραφών και επεξεργαστή ρυθμίσεων.

Είναι συνοδοιπόρος, όχι αντικαταστάτης. Κάθε οθόνη πατά σε κάτι που το MediaMTX ήδη εκθέτει: ένα path, ένα endpoint του API, ένα hook `runOn*`, ένα πρωτόκολλο που σερβίρει εγγενώς. Δεν αποθηκεύει βίντεο, δεν κάνει proxy σε μέσα, δεν κρατά βάση δεδομένων.

## Γρήγορη εκκίνηση

Images πολλαπλών αρχιτεκτονικών (`linux/amd64`, `linux/arm64`)· το Docker κατεβάζει το σωστό.

**Τρέχει ήδη MediaMTX;** Βάλτε το Connect δίπλα του:

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

**Ξεκινάτε από το μηδέν;** Το compose που περιλαμβάνεται κάνει build το Connect και το τρέχει δίπλα στο MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Έπειτα ανοίξτε το <http://localhost:3000>.

> [!IMPORTANT]
> Το Connect χρειάζεται `api: yes` στο `mediamtx.yml` σας. Η [συμπεριλαμβανόμενη ρύθμιση](../../mediamtx.yml) δουλεύει ως έχει.

## Τι κερδίζετε

### Ζωντανή προβολή

Κάθε path που γνωρίζει το MediaMTX, σε πλέγμα 2 έως 4 στηλών.

- **WebRTC ή HLS, ανά κάρτα.** Το `AUTO` περνά σιωπηλά σε εναλλακτική, το `LOW-LAT` επιμένει σε WebRTC και το `COMPAT` επιβάλλει HLS. Κάθε κάρτα αναφέρει τη μεταφορά που όντως πέτυχε.
- **Στιγμιότυπα σε αδράνεια.** Μια εργασία παρασκηνίου κρατά ένα πρόσφατο καρέ σε κάθε κάρτα, με την ηλικία του πάνω στην ετικέτα. Χρειάζεστε ένα φρέσκο τώρα; Τραβήξτε το από το μενού της κάρτας.
- **Ζωντανή τηλεμετρία.** Codecs, αριθμός θεατών και χρόνος λειτουργίας, κατευθείαν από τη λίστα των path.
- **Τίμια κατάσταση εγγραφής.** Οι κάρτες δείχνουν αν μια ροή γράφει *πραγματικά*· μια κατάσταση που δεν μπόρεσε να διαβάσει το Connect λέγεται άγνωστη, ποτέ ανενεργή.
- **URL δημοσίευσης στο πρόχειρο.** RTSP, RTMP και SRT, χτισμένα από τις ίδιες τις διευθύνσεις ακρόασης του server. Η σελίδα κάθε path πηγαίνει παραπέρα με ένα πάνελ δημοσίευσης και ανάγνωσης: κάθε πρωτόκολλο που σερβίρει ο server, μαζί με WHIP, WHEP, HLS και τις παραλλαγές TLS, με έτοιμα προς αντιγραφή αποσπάσματα για ffmpeg, GStreamer, OBS, ffplay και VLC.

### Εγγραφές

- Ένα ημερήσιο χρονολόγιο ανά ροή από τον server αναπαραγωγής του MediaMTX: τα εγγεγραμμένα διαστήματα και τα κενά ανάμεσά τους, το καθένα με δυνατότητα αναπαραγωγής. Αν η αναπαραγωγή είναι απενεργοποιημένο, το Connect απαριθμεί τις ακριβείς αλλαγές ρυθμίσεων που χρειάζεται και τις εφαρμόζει με ένα κλικ.
- Λήψη αποσπάσματος: οποιοδήποτε διάστημα έως μία ώρα (ή τα τελευταία 5 λεπτά, 15 λεπτά ή την τελευταία ώρα) ως ένα απλό MP4, που το MediaMTX συρράπτει από τα τμήματα χωρίς επανακωδικοποίηση.
- Τμήματα MP4 ή MPEG-TS ανά ροή, ομαδοποιημένα ανά ημέρα, με αυτόματες μικρογραφίες.
- Ένα player που ξεδιπλώνεται επιτόπου, με αναζήτηση μέσω αιτημάτων HTTP Range.
- Λήψεις που ρέουν, με ζωντανή πρόοδο και ακύρωση.
- Πατήστε `/` για φιλτράρισμα.

### Συνεδρίες

- **Όλοι οι συνδεδεμένοι, σε έναν πίνακα.** Εκδότες και αναγνώστες μέσω RTSP, RTSPS, RTMP, RTMPS, SRT, WebRTC και HLS, με απομακρυσμένη διεύθυνση, bytes εισόδου και εξόδου και χρόνο σύνδεσης, με ανανέωση κάθε 5 δευτερόλεπτα.
- **Αποσυνδέστε έναν πελάτη** μετά από επιβεβαίωση. Μπορεί να ξανασυνδεθεί· η αποσύνδεση δεν είναι αποκλεισμός.

### Ρυθμίσεις, χωρίς YAML

- **Η ρύθμιση του server:** 66 χειριστήρια με τύπο και επικύρωση σε Logging, API, Authentication, Hooks, RTSP, RTMP, HLS, WebRTC και SRT.
- **Path defaults και παρακάμψεις ανά path**, στα εύρη από τα οποία τα σερβίρει το MediaMTX. Η αποθήκευση μιας ροής που καλύπτεται από wildcard γράφει μια αραιή εγγραφή, οπότε τα κλειδιά που δεν αγγίξατε συνεχίζουν να ακολουθούν τις προεπιλογές.
- **Ένας κατάλογος path** με σήματα live και regex, μια καθοδηγούμενη φόρμα «προσθήκη κάμερας RTSP» και επαναφορά ή διαγραφή της δικής εγγραφής οποιουδήποτε path (με προειδοποίηση αν είναι κάποιος συνδεδεμένος).
- **Ζωντανή υγεία στη σελίδα κάθε path:** κομμάτια, αναγνώστες, bytes που μεταφέρθηκαν, καρέ με σφάλματα και χρόνος λειτουργίας, με ανανέωση κάθε 5 δευτερόλεπτα. Ένα path χωρίς δημοσίευση εμφανίζεται αδρανές, όχι χαλασμένο.
- **Ανθεκτικότητα σε κάθε path:** μια πάντα διαθέσιμη εφεδρεία που παίζει σε επανάληψη ένα offline κλιπ όσο η κάμερα είναι εκτός, και τράβηγμα κατ' απαίτηση που ανοίγει την πηγή μόνο όσο κάποιος παρακολουθεί.
- **Κάθε hook `runOn*`**, με προειδοποίηση εκεί όπου η αποθήκευση επανεκκινεί το path.
- **Προώθηση:** στείλτε ένα path στο YouTube, στο Twitch ή σε άλλον server μέσω της εγγενούς λίστας `forward` του MediaMTX, με κρυμμένα κλειδιά ροής και χωρίς επανεκκίνηση του path.
- **Αραιές εγγραφές.** Στέλνονται μόνο τα κλειδιά που αλλάξατε.

### Λειτουργία

Μία διεργασία για API, SPA και μέσα · πολλαπλές αρχιτεκτονικές · `GET /api/health` · έκδοση MediaMTX στην κεφαλίδα · δομημένα logs · εγκαταστάσιμο ως PWA · φωτεινό και σκοτεινό · 30 γλώσσες · καμία βάση δεδομένων.

## Μεταβλητές περιβάλλοντος

Σπέρνουν την πρώτη εκκίνηση. Όλα παραμένουν επεξεργάσιμα από το **Config**.

| Μεταβλητή | Προεπιλογή στο image | Σκοπός |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Πού φτάνει το Connect το API του MediaMTX |
| `MEDIAMTX_API_PORT` | `9997` | Θύρα του API του MediaMTX |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Πού φτάνει ο *browser* το MediaMTX για αναπαραγωγή. Ορίστε το όποτε ο browser δεν βρίσκεται στον server |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Από πού διαβάζει το Connect τις εγγραφές |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Πού αποθηκεύονται τα στιγμιότυπα και οι μικρογραφίες |
| `DATA_DIR` | `/data` | Πού βρίσκεται το `config.json` |
| `PORT` | `3000` | Θύρα HTTP |
| `LOG_LEVEL` | `info` | Επίπεδο καταγραφής του Pino |

Το `http://mediamtx` επιλύεται μόνο στο δίκτυο του compose που περιλαμβάνεται. Για αυτόνομο `docker run`, βάλτε τον δικό σας host. Με compose, ορίστε το `REMOTE_MEDIAMTX_HOST` στο `.env` αντί για το `REMOTE_MEDIAMTX_URL`: ορίζει επίσης τον host WebRTC που ανακοινώνει το MediaMTX. Το [`.env.example`](../../.env.example) εξηγεί την καθεμία, και το `pnpm dev` χρησιμοποιεί προεπιλογές localhost χωρίς κανένα `.env`.

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

Η ζωντανή αναπαραγωγή πάει από τον browser στο MediaMTX. Το Connect μετακινεί JSON, συν τις εγγραφές και τις μικρογραφίες: από τον δίσκο, ή εγγεγραμμένα διαστήματα μέσω proxy από τον server αναπαραγωγής του MediaMTX.

## Τεκμηρίωση

| | |
|---|---|
| [Δυνατότητες](../../docs/FEATURES.md) | Κάθε δυνατότητα, διαδρομή και διαδικασία που έχει κυκλοφορήσει |
| [Αρχιτεκτονική](../../docs/ARCHITECTURE.md) | Πώς δένουν τα κομμάτια |
| [Συνεισφορά](../../CONTRIBUTING.md) | Στήσιμο ανάπτυξης, scripts, διαδικασία PR |
| [Παραδείγματα](../../examples/) | Κάμερα Raspberry Pi, πλαστές ροές για δοκιμές |

## Συνεισφορά

Τα issues και τα PR είναι ευπρόσδεκτα. Το `pnpm install && pnpm dev` σας δίνει ολόκληρο το stack με δοκιμαστικά δεδομένα. Δείτε το [CONTRIBUTING.md](../../CONTRIBUTING.md), και σημειώστε ότι οι τίτλοι των PR είναι conventional commits. Ακολουθούμε έναν [Κώδικα Δεοντολογίας](../../CODE_OF_CONDUCT.md).

## Άδεια

[MIT](../../LICENSE)
