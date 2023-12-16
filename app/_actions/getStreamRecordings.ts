"use server";
import fs from "fs";
import path from "path";

import getAppConfig from "./getAppConfig";

export interface StreamRecording {
  name: string;
  createdAt: Date;
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

  const recordingsWithTime: StreamRecording[] = recordingFiles.map((r) => ({
    name: r,
    createdAt: fs.statSync(path.join(config.recordingsDirectory, streamName, r))
      .birthtime,
  }));
  return recordingsWithTime;
}
