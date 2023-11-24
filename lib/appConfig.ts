export interface AppConfig {
  recordingsDirectory: string;
  screenshotsDirectory: string;
}

const appConfig: AppConfig = {
  recordingsDirectory: process.env.MEDIAMTX_RECORDINGS_DIR || "/recordings",
  screenshotsDirectory: process.env.MEDIAMTX_SCREENSHOTS_DIR || "/screenshots",
};
export default appConfig;
