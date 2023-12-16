"use server";

import { Api, GlobalConf } from "@/lib/MediaMTX/generated";
import getAppConfig from "./getAppConfig";

export default async function updateGlobalConfig({
  globalConfig,
}: {
  globalConfig: GlobalConf;
}): Promise<boolean> {
  const config = await getAppConfig();
  if (!config) {
    return false;
  }
  console.log("Updating Global Config");
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  });

  try {
    const resp = await api.v3.configGlobalSet(globalConfig);
    const status = resp.status;
    if (status !== 200) {
      throw new Error(`Error setting global config: ${status}`);
    }

    console.log({ resp, status });
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}
