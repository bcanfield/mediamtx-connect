import type { ReadStream } from 'node:fs'
import fs, { createReadStream } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { NextResponse } from 'next/server'
import { getAppConfig } from '@/features/config/client'
import { logger } from '@/shared/utils'

// 1x1 transparent PNG to return when no screenshot exists
// This prevents Next.js image optimizer errors
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

function notFoundResponse() {
  return new NextResponse(TRANSPARENT_PNG, {
    status: 404,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ streamName: string }> },
) {
  const { streamName } = await params
  const config = await getAppConfig()
  if (!config) {
    return notFoundResponse()
  }

  try {
    const screenshotDir = path.resolve(config.screenshotsDirectory, streamName)
    logger.info(`[first-screenshot] Looking for screenshots in: ${screenshotDir} (cwd: ${process.cwd()})`)

    // Check if directory exists before trying to read it
    if (!fs.existsSync(screenshotDir)) {
      logger.info(`[first-screenshot] Screenshot directory doesn't exist: ${screenshotDir}`)
      return notFoundResponse()
    }

    const streamScreenshots = fs
      .readdirSync(screenshotDir)
      .filter(f => !f.startsWith('.') && f.endsWith('.png'))
      .sort()
    logger.info(`[first-screenshot] Found ${streamScreenshots.length} screenshots in ${screenshotDir}`)
    if (streamScreenshots.length === 0) {
      return notFoundResponse()
    }

    // Get the most recent screenshot (last when sorted alphabetically by timestamp)
    const firstScreenshot = streamScreenshots[streamScreenshots.length - 1]
    const screenshotPath = path.resolve(
      config.screenshotsDirectory,
      streamName,
      firstScreenshot,
    )

    logger.info(`[first-screenshot] Serving screenshot: ${screenshotPath}`)

    if (!fs.existsSync(screenshotPath)) {
      logger.info(`[first-screenshot] Screenshot file doesn't exist: ${screenshotPath}`)
      return notFoundResponse()
    }

    const data: ReadableStream = streamFile(screenshotPath)

    const res = new NextResponse(data, {
      status: 200,
      headers: new Headers({
        'content-type': 'image/png',
      }),
    })
    return res
  }
  catch (error) {
    logger.error(`Error getting first screenshot for ${streamName}: ${error}`)
    return notFoundResponse()
  }
}
function streamFile(path: string): ReadableStream {
  const downloadStream = createReadStream(path)
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(downloadStream),
  )
  return data
}

async function* nodeStreamToIterator(stream: ReadStream) {
  for await (const chunk of stream) {
    yield chunk
  }
}

/**
 * Taken from Next.js doc
 * https://nextjs.org/docs/app/building-your-application/routing/router-handlers#streaming
 * Itself taken from mozilla doc
 * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 */
function iteratorToStream(
  iterator: AsyncGenerator<Buffer, void, unknown>,
): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()

      if (done) {
        controller.close()
      }
      else {
        // conversion to Uint8Array is important here otherwise the stream is not readable
        // @see https://github.com/vercel/next.js/issues/38736
        controller.enqueue(new Uint8Array(value))
      }
    },
  })
}
