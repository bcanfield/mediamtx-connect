"use server";
import fs from "fs";
import path from "path";

import getAppConfig from "./getAppConfig";
import getScreenshot from "./getScreenshot";

export interface StreamRecording {
  name: string;
  createdAt: Date;
  base64: string | null;
  fileSize: number;
}
export default async function getRecordings({
  page = 1,
  take = 1,
  streamName,
}: {
  recordingsDirectory: string;
  screenshotsDirectory: string;
  page?: number;
  take?: number;
  streamName: string;
}) {
  const config = await getAppConfig();
  console.log("Getting Recordings");
  if (!config) {
    return [];
  }
  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  const recordingFiles = fs
    .readdirSync(path.join(config.recordingsDirectory, streamName))
    .filter((f) => !f.startsWith("."))
    .sort((one, two) => (one > two ? -1 : 1))
    .slice(startIndex, endIndex);

  const recordingsWithTime: StreamRecording[] = await Promise.all(
    recordingFiles.map(async (r) => {
      const stat = fs.statSync(
        path.join(config.recordingsDirectory, streamName, r),
      );
      return {
        name: r,
        createdAt: stat.mtime,
        base64: await getScreenshot({
          recordingFileName: r,
          streamName: streamName,
        }),
        fileSize: stat.size,
      };
    }),
  );

  return recordingsWithTime;
}
