"use server";

import appConfig from "@/lib/appConfig";
import { Api, GlobalConf } from "@/lib/MediaMTX/generated";

export default async function updateGlobalConfig({
  globalConfig,
}: {
  globalConfig: GlobalConf;
}): Promise<boolean> {
  const { url, port } = appConfig;

  console.log("Updating Global Config");
  const api = new Api({ baseUrl: `${url}:${port}` });

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
