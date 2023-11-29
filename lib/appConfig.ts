export const dynamic = "force-dynamic";

export interface AppConfig {
  url: string;
  port: number;
  recordingsDirectory: string;
  screenshotsDirectory: string;
  remoteMediaMtxUrl: string;
}

const appConfig: AppConfig = {
  url: process.env.BACKEND_SERVER_MEDIAMTX_URL || "http://mediamtx",
  port: process.env.MEDIAMTX_API_PORT ? +process.env.MEDIAMTX_API_PORT : 9997,
  recordingsDirectory: process.env.MTX_UI_RECORDINGS_DIR || "/recordings",
  screenshotsDirectory: process.env.MTX_UI_SCREENSHOTS_DIR || "/screenshots",
  remoteMediaMtxUrl:
    process.env.REMOTE_BROWSER_MEDIAMTX_URL || "http://localhost",
};

export default appConfig;
