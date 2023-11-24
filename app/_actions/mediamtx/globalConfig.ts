"use server";

interface MtxConfig {
  hls: boolean;
  hlsAddress: string;
  apiAddress: string;
  hlsEncryption: boolean;
}

interface AppConfig extends MtxConfig {
  url: string;

  // For local development only
  recordingsDirectory: string;
  screenshotsDirectory: string;
}

export async function appConfig() {
  console.log("getting global config");
  const mediaMtxUrl = process.env.MEDIAMTX_URL || "http://localhost";
  const mediaMtxApiPort = process.env.MEDIAMTX_API_PORT || 9997;
  const res = await fetch(
    `${mediaMtxUrl}:${mediaMtxApiPort}/v3/config/global/get`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const response: MtxConfig = await res.json();

  const globalConfig: AppConfig = {
    url: mediaMtxUrl,
    recordingsDirectory: process.env.MEDIAMTX_RECORDINGS_DIR || "/recordings",
    screenshotsDirectory:
      process.env.MEDIAMTX_SCREENSHOTS_DIR || "/screenshots",
    ...response,
  };
  return globalConfig;
}
