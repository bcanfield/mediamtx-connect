export interface AppConfig {
  url: string;
  recordingsDirectory: string;
  screenshotsDirectory: string;
}

const appConfig: AppConfig = {
  url: process.env.BACKEND_SERVER_MEDIAMTX_URL || "http://localhost",
  recordingsDirectory: "/recordings",
  screenshotsDirectory: "/screenshots",
};
export default appConfig;
