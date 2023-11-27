import path from "path";
import fs from "fs";
import { redirect } from "next/navigation";
import RecordingCard from "./_components/recordingCard";

import ffmpeg from "fluent-ffmpeg";

interface Recording {
  fileName: string;
  imageData?: Buffer;
}
export default async function Recordings({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: { take: number; page: number };
}) {
  const page = searchParams.page || 1;
  const take = searchParams.take || 5;
  const recordingsDir = process.env.MEDIAMTX_RECORDINGS_DIR;
  const screenshotsDir = process.env.SCREENSHOTS_DIR;

  if (!recordingsDir) {
    redirect("/404");
  }

  const streamRecordingsDir = path.join(recordingsDir, params.name);

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;
  const recordingFiles = fs.readdirSync(streamRecordingsDir);
  recordingFiles.reverse();

  const recordings = recordingFiles
    .slice(startIndex, endIndex)
    .map((r) => ({ fileName: r }));

  const newRecordings: Recording[] = [];

  if (screenshotsDir) {
    const streamScreenshotsDir = path.join(screenshotsDir, params.name);

    // For each recording, look for screenshot file, and generate if it doesnt exist
    await Promise.all(
      recordings.map(async ({ fileName }) => {
        const recordingFilePath = path.join(streamRecordingsDir, fileName);

        const pngFileName = `${fileName.split(".")[0]}.png`;
        const screenshotFilePath = path.join(streamScreenshotsDir, pngFileName);
        const exists = fs.existsSync(screenshotFilePath);

        if (!exists) {
          console.log(`Generating new screenshot for ${screenshotFilePath}.`);

          try {
            await takeScreenshots(recordingFilePath, streamScreenshotsDir, fileName)
            const image = fs.readFileSync(screenshotFilePath);
            newRecordings.push({ fileName, imageData: image });
          } catch {
           console.error('error taking screenshot')
           return
          }
        } else {
          console.log(`Screenshot for ${screenshotFilePath} already exists.`);

        }
        const image = fs.readFileSync(screenshotFilePath);

        newRecordings.push({fileName, imageData: image})
      })
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-4 items-center p-2">
      {newRecordings
        .sort((a, b) => {
          const valueA = a.fileName.toLowerCase();
          const valueB = b.fileName.toLowerCase();

          if (valueA > valueB) {
            return -1;
          }
          if (valueA < valueB) {
            return 1;
          }
          return 0;
        })
        .map(({ fileName, imageData }) => (
          <RecordingCard
          key={fileName}
            filePath={path.join(params.name, fileName)}
            imageData={imageData}
          ></RecordingCard>
        ))}
    </div>
  );
}

function takeScreenshots(recordingFilePath: string, streamScreenshotsDir: string, fileName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
      ffmpeg(recordingFilePath)
          .on("filenames", function (filenames: string[]) {
              console.log("Will generate " + filenames.join(", "));
          })
          .on("end", function () {
              console.log("Screenshots taken");
              resolve(); // Resolve the promise when screenshots are taken
          })
          .on("error", function (err: Error) {
              console.error("Error capturing screenshots:", err);
              reject(err); // Reject the promise if there's an error
          })
          .screenshots({
              count: 1,
              filename: `${fileName.split(".")[0]}.png`,
              folder: streamScreenshotsDir,
          });
  });
}