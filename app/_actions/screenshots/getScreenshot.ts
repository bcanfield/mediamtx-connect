"use server";
import fs from "fs";
import path from "path";

import appConfig from "@/lib/appConfig";

const getFileNamesWithoutExtension = (directoryPath: string) => {
  try {
    const files = fs.readdirSync(directoryPath);
    return files.map((file) => path.parse(file).name);
  } catch (err) {
    throw new Error(`Error reading directory: ${err}`);
  }
};

export default async function getRecordingScreenshot({
  streamName,
  recordingName,
}: {
  streamName: string;
  recordingName: string;
}) {
  console.log("Getting Recordings");
  const { screenshotsDirectory } = appConfig;

  let base64: string | null = null;

  const screenshotPath = path.join(
    screenshotsDirectory,
    streamName,
    `${path.parse(recordingName).name}.png`,
  );

  console.log({ screenshotPath });
  try {
    const imageData = fs.readFileSync(screenshotPath);
    base64 = `data:image/png;base64,${Buffer.from(imageData).toString(
      "base64",
    )}`;
  } catch {
    console.error("error generating screenshot");
  }

  return base64;
}
