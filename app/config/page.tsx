export const dynamic = "force-dynamic";

import { Api, GlobalConf } from "@/lib/MediaMTX/generated";
import getAppConfig from "../_actions/getAppConfig";
import PageLayout from "../_components/page-layout";
import ConfigForm from "./config-form";

export default async function Config() {
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
  return (
    <PageLayout header="Global Config">
      <ConfigForm globalConf={globalConf} />
    </PageLayout>
  );
}
