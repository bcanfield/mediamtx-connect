"use server";
import fs from "fs";
import path from "path";

import appConfig from "@/lib/appConfig";

export default async function getFirstScreenshot({
  streamName,
}: {
  streamName: string;
}) {
  console.log("Getting First screenshot");
  const { screenshotsDirectory, recordingsDirectory } = appConfig;

  let base64: string | null = null;

  const firstRecording = fs
    .readdirSync(path.join(recordingsDirectory, streamName))
    .filter((f) => !f.startsWith("."));
  if (firstRecording.length === 0) {
    return;
  }

  console.log({ fr: firstRecording[0] });
  const screenshotPath = path.join(
    screenshotsDirectory,
    streamName,
    `${path.parse(firstRecording[0]).name}.png`,
  );

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
