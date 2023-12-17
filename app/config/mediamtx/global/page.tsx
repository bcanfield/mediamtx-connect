export const dynamic = "force-dynamic";

import getAppConfig from "@/app/_actions/getAppConfig";
import { Api, GlobalConf } from "@/lib/MediaMTX/generated";
import ConfigForm from "../../config-form";

export default async function Global() {
  const config = await getAppConfig();
  if (!config) {
    return <div>Invalid Config</div>;
  }
  let globalConf: GlobalConf | undefined;
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  });

  try {
    const mediaMtxConfig = await api.v3.configGlobalGet({ cache: "no-cache" });
    globalConf = mediaMtxConfig?.data;
  } catch {
    console.error("Error reaching MediaMTX at: ", config.mediaMtxUrl);
  }
  return <ConfigForm globalConf={globalConf} />;
}
