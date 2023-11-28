export interface AppConfig {
  url: string;
  recordingsDirectory: string;
  screenshotsDirectory: string;
  remoteMediaMtxUrl: string;
}

const appConfig: AppConfig = {
  url: process.env.BACKEND_SERVER_MEDIAMTX_URL || "http://localhost",
  recordingsDirectory: process.env.MTX_UI_RECORDINGS_DIR || "/recordings",
  screenshotsDirectory: process.env.MTX_UI_SCREENSHOTS_DIR || "/screenshots",
  remoteMediaMtxUrl:
    process.env.REMOTE_BROWSER_MEDIAMTX_URL || "http://localhost",
};
export default appConfig;
