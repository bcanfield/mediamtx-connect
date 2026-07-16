import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { Hono } from 'hono'
import { getAppConfig } from './config-store'
import { logger } from './logger'

// Binary/streaming endpoints — screenshots and recordings. JSON lives in the
// oRPC router; files live here.
export const media = new Hono()

function safeJoin(baseDir: string, ...segments: string[]): string | null {
  const resolved = path.resolve(baseDir, ...segments)
  return resolved.startsWith(path.resolve(baseDir) + path.sep) ? resolved : null
}

function streamResponse(filePath: string, headers: Record<string, string>, status = 200, opts?: { start: number, end: number }) {
  const nodeStream = opts ? createReadStream(filePath, opts) : createReadStream(filePath)
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status, headers })
}

media.get('/screenshots/:streamName/latest', async (c) => {
  const config = await getAppConfig()
  const dir = safeJoin(config.screenshotsDirectory, c.req.param('streamName'))
  if (!dir || !existsSync(dir))
    return c.text('Screenshot not found', 404, { 'Cache-Control': 'no-store' })

  // live.png is the periodic snapshot of the running stream. Streams that are
  // offline (or predate the capture job) fall back to their newest recording
  // thumbnail, whose %Y-%m-%d_%H-%M-%S name sorts chronologically.
  const live = path.join(dir, 'live.png')
  if (existsSync(live)) {
    return streamResponse(live, {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    })
  }

  const latest = readdirSync(dir).filter(f => f.endsWith('.png')).sort().at(-1)
  if (!latest)
    return c.text('Screenshot not found', 404, { 'Cache-Control': 'no-store' })
  return streamResponse(path.join(dir, latest), {
    'Content-Type': 'image/png',
    'Cache-Control': 'no-store',
  })
})

media.get('/screenshots/:streamName/:file', async (c) => {
  const config = await getAppConfig()
  const filePath = safeJoin(config.screenshotsDirectory, c.req.param('streamName'), c.req.param('file'))
  if (!filePath || !filePath.endsWith('.png') || !existsSync(filePath))
    return c.text('Screenshot not found', 404, { 'Cache-Control': 'no-store' })

  return streamResponse(filePath, {
    'Content-Type': 'image/png',
    'Cache-Control': 'no-store',
  })
})

media.get('/recordings/:streamName/:file', async (c) => {
  const config = await getAppConfig()
  const filePath = safeJoin(config.recordingsDirectory, c.req.param('streamName'), c.req.param('file'))
  if (!filePath || !existsSync(filePath))
    return c.text('Recording not found', 404)

  let size: number
  try {
    size = statSync(filePath).size
  }
  catch (error) {
    logger.error({ err: error }, `Failed to stat recording ${filePath}`)
    return c.text('Recording not found', 404)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
  }
  if (c.req.query('download') !== undefined)
    headers['Content-Disposition'] = `attachment; filename="${c.req.param('file')}"`

  const range = c.req.header('Range')
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null
  const rangeStart = match?.[1] ?? ''
  const rangeEnd = match?.[2] ?? ''
  if (rangeStart || rangeEnd) {
    const start = rangeStart ? Number.parseInt(rangeStart, 10) : Math.max(0, size - Number.parseInt(rangeEnd, 10))
    const end = rangeStart && rangeEnd ? Math.min(Number.parseInt(rangeEnd, 10), size - 1) : size - 1
    if (start >= size || start > end)
      return c.text('Range not satisfiable', 416, { 'Content-Range': `bytes */${size}` })

    return streamResponse(filePath, {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
    }, 206, { start, end })
  }

  return streamResponse(filePath, { ...headers, 'Content-Length': String(size) })
})
