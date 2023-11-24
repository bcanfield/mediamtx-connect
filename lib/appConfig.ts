export interface AppConfig {
  url: string;
  recordingsDirectory: string;
  screenshotsDirectory: string;
}

const appConfig: AppConfig = {
  url: process.env.MEDIAMTX_URL || "http://localhost",
  recordingsDirectory: process.env.MEDIAMTX_RECORDINGS_DIR || "/recordings",
  screenshotsDirectory: process.env.MEDIAMTX_SCREENSHOTS_DIR || "/screenshots",
};
export default appConfig;
