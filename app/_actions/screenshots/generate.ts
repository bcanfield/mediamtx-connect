"use server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

import { readdir, stat } from "fs/promises";

interface ScreenshotResponse {
  [streamName: string]: string[];
}
export default async function generateScreenshots({
  recordingsDirectory,
  screenshotsDirectory,
  page = 1,
  take = 1,
  streamName,
}: {
  recordingsDirectory: string;
  screenshotsDirectory: string;
  page?: number;
  take?: number;
  streamName?: string;
}): Promise<ScreenshotResponse> {
  console.log("Generating Screenshots");
  if (!fs.existsSync(screenshotsDirectory)) {
    fs.mkdirSync(screenshotsDirectory);
    console.log("Screenshots Directory created successfully.");
  } else {
    console.log("Screenshots Directory already exists.");
  }

  const generated: ScreenshotResponse = {};

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  try {
    const files = (await readdir(recordingsDirectory)).filter(
      (file) => !streamName || file === streamName
    );

    for (const file of files) {
      console.log("generating screenshot for stream dir", file);
      const filePath = path.join(recordingsDirectory, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        const streamRecordingDir = path.join(recordingsDirectory, file);
        const streamrecordings = (await readdir(streamRecordingDir)).slice(
          startIndex,
          endIndex
        );
        for (const streamRecording of streamrecordings) {
          console.log({ streamRecording });
          const streamRecordingPath = path.join(
            streamRecordingDir,
            streamRecording
          );
          const streamScreenshotDirectory = path.join(
            screenshotsDirectory,
            file
          );
          const screenshotFileName = `${streamRecording.split(".")[0]}.png`;
          console.log({ screenshotFileName });
          if (
            fs.existsSync(
              path.join(streamScreenshotDirectory, screenshotFileName)
            )
          ) {
            console.log("Screenshot already exists");
          } else {
            await new Promise<void>((resolve, reject) => {
              ffmpeg(streamRecordingPath)
                .on("end", function () {
                  resolve(); // Resolve the promise when screenshots are taken
                })
                .on("error", function (err: Error) {
                  console.error("Error capturing screenshots:", err);
                  reject(err); // Reject the promise if there's an error
                })
                .screenshots({
                  count: 1,
                  size: "320x240",
                  filename: screenshotFileName,
                  folder: streamScreenshotDirectory,
                });
            });
          }
          generated[file] = generated[file]
            ? [
                ...generated[file],
                path.join(streamScreenshotDirectory, screenshotFileName),
              ]
            : [path.join(streamScreenshotDirectory, screenshotFileName)];
        }
      }
    }
  } catch (err) {
    console.error("Error processing directory:", err);
    throw err;
  }
  console.log("FNIISHES", { generated });
  return generated;
}
