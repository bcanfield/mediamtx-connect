<div align="center">

# MediaMTX Connect

**A modern web UI for [MediaMTX](https://github.com/bluenviron/mediamtx) media server**

View, manage, and record your RTSP/RTMP/HLS/WebRTC streams from one dashboard.

[![CI](https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI)](https://github.com/bcanfield/mediamtx-connect/actions)
[![Docker](https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue)](https://hub.docker.com/r/bcanfield/mediamtx-connect)
[![Release](https://img.shields.io/github/v/release/bcanfield/mediamtx-connect)](https://github.com/bcanfield/mediamtx-connect/releases)

</div>

<br />

https://github.com/bcanfield/mediamtx-connect/assets/12603953/ae1e3e0f-401e-4560-a373-b46ea5679870

## Features

- **Live Stream Viewing** - Watch all your streams in-browser via HLS
- **Recording Management** - Browse, playback, and manage recordings
- **Stream Monitoring** - Real-time status for all connected sources
- **Multi-Protocol** - Works with RTSP, RTMP, HLS, and WebRTC streams
- **Dark Mode** - Easy on the eyes, day or night

## Quick Start

```bash
# Clone and run
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker-compose up -d
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

```bash
docker pull bcanfield/mediamtx-connect
```

See [Deployment Guide](./docs/DEPLOYMENT.md) for full docker-compose setup with MediaMTX.

## Tech Stack

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://radix-ui.com), and [Prisma](https://prisma.io).

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## License

MIT
