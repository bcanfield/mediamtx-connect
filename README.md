<div align="center">
  <h1 align="center">
  MediaMTX Connect
</h1>
  
  <strong>User Interface for [MediaMTX](https://github.com/bluenviron/mediamtx)</strong>

  ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI)
  [![Docker Hub](https://img.shields.io/badge/bcanfield/mediamtx--connect-docker?label=docker&color=blue)](https://hub.docker.com/r/bcanfield/mediamtx-connect)
  [![Github Release](https://img.shields.io/github/v/release/bcanfield/mediamtx-connect)](https://github.com/bcanfield/mediamtx-connect/releases)
</div>
<br>

⚠️ Docs in Progress ⚠️



## Usage

docker-compose (recomended)
```
version: "3.4"
services:
  mediamtx:
    image: bluenviron/mediamtx
    container_name: mediamtx
    restart: unless-stopped
    environment:
      - MTX_API=yes
      - MTX_APIADDRESS=:9997
      - MTX_RECORD=yes
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR}:/recordings
    networks:
      - mtx
    ports:
      - 8554:8554
      - 8890:8890/udp
      - 1935:1935
      - 8888:8888
      - 8889:8889
      - 9997:9997
  mediamtx-connect:
    image: bcanfield/mediamtx-connect
    container_name: mediamtx-connect
    restart: unless-stopped
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR}:/recordings
    environment:
      - REMOTE_BROWSER_MEDIAMTX_URL=${REMOTE_BROWSER_MEDIAMTX_URL}
    networks:
      - mtx
    ports:
      - 3000:3000
networks:
  mtx:
    name: mtx

```
