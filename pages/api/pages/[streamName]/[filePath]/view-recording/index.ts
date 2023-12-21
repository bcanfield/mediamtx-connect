// import { stat, createReadStream } from 'fs';
import { stat } from "fs/promises";
import { createReadStream } from "fs";

import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getAppConfig from "@/app/_actions/getAppConfig";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { streamName, filePath } = req.query;

  const config = await getAppConfig(); // Assuming getAppConfig is defined elsewhere

  if (!config) {
    return res.status(500).end();
  }

  const recordingPath = path.join(
    config.recordingsDirectory,
    streamName as string,
    filePath as string,
  );

  // Get the file stats
  const stats = await stat(recordingPath);

  // Calculate range
  const range = req.headers.range;
  const fileSize = stats.size;
  // const CHUNK_SIZE = 10 ** 6; // 1MB chunk size, you can adjust this

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    console.log({ parts });
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4", // Change the content type according to your video format
    });

    const fileStream = createReadStream(recordingPath, { start, end });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4", // Change the content type according to your video format
    });

    const fileStream = createReadStream(recordingPath);

    fileStream.pipe(res);
  }
}
