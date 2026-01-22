import type { ReadStream } from 'node:fs'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getAppConfig } from '@/features/config/client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ streamName: string, filePath: string }> },
) {
  const { streamName, filePath } = await params
  const config = await getAppConfig()
  if (!config) {
    return new NextResponse(null, { status: 500 })
  }

  const recordingPath = path.join(
    config.recordingsDirectory,
    streamName,
    filePath,
  )

  // Check if file exists before trying to read it
  if (!existsSync(recordingPath)) {
    return new NextResponse('Recording not found', { status: 404 })
  }

  let stats
  try {
    stats = await stat(recordingPath)
  }
  catch {
    return new NextResponse('Recording not found', { status: 404 })
  }

  // Create a read stream for the video file
  const videoStream = streamFile(recordingPath)

  // Set response headers for video streaming
  const res = new NextResponse(videoStream, {
    status: 200,
    headers: new Headers({
      'Content-Type': 'video/mp4', // Change the content type according to your video format
      'Accept-Ranges': 'bytes', // Allow seeking within the video
      'Content-Length': stats.size.toString(), // Set the content length of the video
    }),
  })

  return res
}
/**
 * Took this syntax from https://github.com/MattMorgis/async-stream-generator
 * Didn't find proper documentation: how come you can iterate on a Node.js ReadableStream via "of" operator?
 * What's "for await"?
 */
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

function streamFile(path: string): ReadableStream {
  const downloadStream = createReadStream(path)
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(downloadStream),
  )
  return data
}
