export const dynamic = "force-dynamic";

export interface AppConfig {
  url: string;
  port: number;
  recordingsDirectory: string;
  screenshotsDirectory: string;
  remoteMediaMtxUrl: string;
}
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Running in mode: ${NODE_ENV}`);
const appConfig: AppConfig = {
  url: process.env.BACKEND_SERVER_MEDIAMTX_URL || "http://mediamtx",
  port: process.env.MEDIAMTX_API_PORT ? +process.env.MEDIAMTX_API_PORT : 9997,
  recordingsDirectory:
    NODE_ENV === "production" ? "/recordings" : "./recordings",
  screenshotsDirectory:
    NODE_ENV === "production" ? "/screenshots" : "./screenshots",
  remoteMediaMtxUrl:
    process.env.REMOTE_BROWSER_MEDIAMTX_URL || "http://localhost",
};

export default appConfig;
