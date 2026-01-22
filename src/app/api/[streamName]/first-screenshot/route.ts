import type { ReadStream } from 'node:fs'
import fs, { createReadStream } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getAppConfig } from '@/features/config/client'

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
    const screenshotDir = path.join(config.screenshotsDirectory, streamName)

    // Check if directory exists before trying to read it
    if (!fs.existsSync(screenshotDir)) {
      return notFoundResponse()
    }

    const streamScreenshots = fs
      .readdirSync(screenshotDir)
      .filter(f => !f.startsWith('.'))
    if (streamScreenshots.length === 0) {
      return notFoundResponse()
    }

    const firstScreenshot = streamScreenshots[streamScreenshots.length - 1]
    const screenshotPath = path.join(
      config.screenshotsDirectory,
      streamName,
      `${path.parse(firstScreenshot).name}.png`,
    )

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
    console.error(`Error Getting First Screenshot: `, error)
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
