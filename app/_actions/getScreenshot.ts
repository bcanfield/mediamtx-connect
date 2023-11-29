"use server";
import fs from "fs";
import path from "path";

import appConfig from "@/lib/appConfig";

export default async function getScreenshot({
  streamName,
  recordingFileName,
}: {
  streamName: string;
  recordingFileName: string;
}) {
  console.log("Getting Recordings");
  const { screenshotsDirectory } = appConfig;

  let base64: string | null = null;

  const screenshotPath = path.join(
    screenshotsDirectory,
    streamName,
    `${path.parse(recordingFileName).name}.png`,
  );

  console.log({ screenshotPath });
  try {
    const imageData = fs.readFileSync(screenshotPath);
    base64 = `data:image/png;base64,${Buffer.from(imageData).toString(
      "base64",
    )}`;
  } catch {
    console.error(
      `Error fetching screenshot for:\n stream: ${streamName}\nrecording: ${recordingFileName}`,
    );
  }

  return base64;
}
