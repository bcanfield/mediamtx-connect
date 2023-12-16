import getAppConfig from "@/app/_actions/getAppConfig";
import { ReadStream, createReadStream } from "fs";
import { stat } from "fs/promises";
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
  const recordingPath = path.join(
    config.recordingsDirectory,
    params.streamName,
    params.filePath,
  );
  const stats = await stat(recordingPath);
  const data: ReadableStream = streamFile(recordingPath);
  const res = new NextResponse(data, {
    status: 200,
    headers: new Headers({
      "content-type": "video/mp4",
      "content-length": stats.size + "",
    }),
  });
  return res;
}

/**
 * Took this syntax from https://github.com/MattMorgis/async-stream-generator
 * Didn't find proper documentation: how come you can iterate on a Node.js ReadableStream via "of" operator?
 * What's "for await"?
 */
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

function streamFile(path: string): ReadableStream {
  const downloadStream = createReadStream(path);
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(downloadStream),
  );
  return data;
}
