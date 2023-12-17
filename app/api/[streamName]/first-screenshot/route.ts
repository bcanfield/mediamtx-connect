import getAppConfig from "@/app/_actions/getAppConfig";
import fs, { ReadStream, createReadStream } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { streamName: string; filePath: string } }, //streamName/fileName
) {
  const config = await getAppConfig();
  if (!config) {
    return new NextResponse(null, {
      status: 500,
    });
  }

  try {
    const streamScreenshots = fs
      .readdirSync(path.join(config.screenshotsDirectory, params.streamName))
      .filter((f) => !f.startsWith("."));
    if (streamScreenshots.length === 0) {
      throw new Error(`No screenshots found for stream: ${params.streamName}`);
    }

    const firstScreenshot = streamScreenshots[0];
    const screenshotPath = path.join(
      config.screenshotsDirectory,
      params.streamName,
      `${path.parse(firstScreenshot).name}.png`,
    );

    const data: ReadableStream = streamFile(screenshotPath);

    const res = new NextResponse(data, {
      status: 200,
      headers: new Headers({
        "content-type": "image/png",
      }),
    });
    return res;
  } catch (error: any) {
    console.error(`Error Getting First Screenshot: `, error);
  }

  return new NextResponse(null, {
    status: 500,
    headers: new Headers({}),
  });
}
function streamFile(path: string): ReadableStream {
  const downloadStream = createReadStream(path);
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(downloadStream),
  );
  return data;
}

async function* nodeStreamToIterator(stream: ReadStream) {
  for await (const chunk of stream) {
    yield chunk;
  }
}

/**
 * Taken from Next.js doc
 * https://nextjs.org/docs/app/building-your-application/routing/router-handlers#streaming
 * Itself taken from mozilla doc
 * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 */
function iteratorToStream(
  iterator: AsyncGenerator<any, void, unknown>,
): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        // conversion to Uint8Array is important here otherwise the stream is not readable
        // @see https://github.com/vercel/next.js/issues/38736
        controller.enqueue(new Uint8Array(value));
      }
    },
  });
}
