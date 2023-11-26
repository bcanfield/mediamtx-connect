"use server";
import fs from "fs";
import path from "path";

import appConfig from "@/lib/appConfig";

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
  console.log("Getting Recordings");
  const { recordingsDirectory } = appConfig;

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  const recordingFiles = fs
    .readdirSync(path.join(recordingsDirectory, streamName))
    .filter((f) => !f.startsWith("."))
    .sort((one, two) => (one > two ? -1 : 1))
    .slice(startIndex, endIndex);

  const recordingsWithTime = recordingFiles.map((r) => ({
    name: r,
    createdAt: fs.statSync(path.join(recordingsDirectory, streamName, r))
      .birthtime,
  }));
  return recordingsWithTime;
}
