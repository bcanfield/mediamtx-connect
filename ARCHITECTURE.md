# MediaMTX Connect Architecture

## System Overview

MediaMTX Connect is a Next.js 14 web application that provides a user interface for viewing and managing media streams from a MediaMTX server.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ Streams Page  │  │ Recordings    │  │ Config Pages  │  │ HLS.js      │  │
│  │ (Live View)   │  │ Pages         │  │               │  │ (Video)     │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └──────┬──────┘  │
└──────────┼──────────────────┼──────────────────┼─────────────────┼──────────┘
           │                  │                  │                 │
           └──────────────────┴────────┬─────────┴─────────────────┘
                                       │
                              ┌────────▼────────┐
                              │   Next.js App   │
                              │   (Port 3000)   │
                              └────────┬────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
    ┌──────▼──────┐            ┌───────▼───────┐           ┌──────▼──────┐
    │   Server    │            │  API Routes   │           │ Background  │
    │   Actions   │            │               │           │ Jobs (Cron) │
    └──────┬──────┘            └───────┬───────┘           └──────┬──────┘
           │                           │                          │
           │                           │                          │
    ┌──────▼──────────────────────────▼──────────────────────────▼──────┐
    │                         DATA LAYER                                 │
    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
    │  │   Prisma    │    │ File System │    │    MediaMTX API     │    │
    │  │  (SQLite)   │    │ (mp4/png)   │    │    (Port 9997)      │    │
    │  └─────────────┘    └─────────────┘    └─────────────────────┘    │
    └───────────────────────────────────────────────────────────────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │    MediaMTX     │
                                               │    Server       │
                                               │ ┌─────────────┐ │
                                               │ │RTSP (8554)  │ │
                                               │ │RTMP (1935)  │ │
                                               │ │HLS  (8888)  │ │
                                               │ └─────────────┘ │
                                               └────────┬────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │  Video Sources  │
                                               │  (IP Cameras,   │
                                               │   OBS, etc.)    │
                                               └─────────────────┘
```

## Core Components

### 1. Pages & Routing

| Route | Purpose |
|-------|---------|
| `/` | Home page - displays live streams from MediaMTX |
| `/recordings` | Lists all streams with recordings |
| `/recordings/[streamname]` | Browse recordings for a specific stream |
| `/config` | Configuration hub |
| `/config/client` | App settings (URLs, directories) |
| `/config/mediamtx/global` | MediaMTX server configuration |

### 2. API Routes

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Health check for Docker/monitoring |
| `GET /api/[streamName]/first-screenshot` | Get latest screenshot for a stream |
| `GET /api/[streamName]/[filePath]/view-recording` | Stream video for playback |
| `GET /api/[streamName]/[filePath]/download-recording` | Download recording file |

### 3. Server Actions (`app/_actions/`)

| Action | Purpose |
|--------|---------|
| `getAppConfig` | Fetch app configuration from database |
| `getStreamRecordings` | List recordings with thumbnails (paginated) |
| `getScreenshot` | Read screenshot file as base64 |
| `updateClientConfig` | Save app settings to database |
| `updateGlobalConfig` | Push config changes to MediaMTX API |

### 4. Background Jobs (`instrumentation.ts`)

| Schedule | Task |
|----------|------|
| Every 30 min | Generate thumbnails via ffmpeg for new recordings |
| Daily at midnight | Clean up screenshots older than 2 days |

## Data Flow

### Live Stream Viewing
```
User → Home Page → MediaMTX API (pathsList) → Stream Cards
                                                    │
                                                    ▼
                                              HLS.js Player
                                                    │
                                                    ▼
                                    MediaMTX HLS endpoint (:8888)
```

### Recording Playback
```
User → Recordings Page → File System (list mp4 files)
                               │
                               ▼
                         Recording Cards
                               │
                               ▼ (click play)
                         API Route → Stream mp4 → Browser Video
```

### Configuration Update
```
User → Config Form → Server Action → Prisma → SQLite
                           │
                           └──────→ revalidatePath("/")
```

## Database Schema

Single table storing application configuration:

```sql
Config {
  id                   Int      -- Primary key
  mediaMtxUrl          String   -- Internal MediaMTX URL (e.g., "http://mediamtx")
  mediaMtxApiPort      Int      -- API port (default: 9997)
  remoteMediaMtxUrl    String   -- Browser-accessible URL (e.g., "http://localhost")
  recordingsDirectory  String   -- Path to mp4 files
  screenshotsDirectory String   -- Path to thumbnails
  createdAt            DateTime
  updatedAt            DateTime
}
```

## Docker Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose                              │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │    mediamtx-connect  │      │       mediamtx           │    │
│  │    (Next.js app)     │◄────►│    (Media Server)        │    │
│  │                      │      │                          │    │
│  │  Port: 3000          │      │  Ports: 8554, 1935,      │    │
│  │  Health: /api/health │      │         8888, 9997       │    │
│  └──────────┬───────────┘      └────────────┬─────────────┘    │
│             │                               │                   │
│             ▼                               ▼                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Shared Volume                            │  │
│  │                  /recordings                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Technologies

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, shadcn/ui |
| Database | SQLite via Prisma ORM |
| Video | HLS.js (browser), ffmpeg (thumbnails) |
| API Client | Auto-generated from MediaMTX OpenAPI spec |
| Scheduling | node-cron |
| Testing | Playwright (E2E) |
| Deployment | Docker (multi-arch: amd64/arm64) |

## File Structure

```
mediamtx-connect/
├── app/
│   ├── _actions/          # Server actions (data fetching/mutations)
│   ├── _components/       # Shared React components
│   ├── api/               # API route handlers
│   ├── config/            # Configuration pages
│   ├── recordings/        # Recordings pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (streams)
├── components/
│   └── ui/                # shadcn/ui components
├── examples/
│   ├── fake-streams/      # Test streams for development
│   └── raspberry-pi-camera/  # Pi camera streaming setup
├── lib/
│   ├── MediaMTX/          # Generated API client
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── scripts/               # Setup and utility scripts
├── instrumentation.ts     # Background job initialization
├── docker-compose.yml     # Container orchestration
└── Dockerfile             # Multi-stage build
```
