export const dynamic = "force-dynamic";

import { Api, GlobalConf } from "@/lib/MediaMTX/generated";
import appConfig from "@/lib/appConfig";
import ConfigForm from "./config-form";
import PageLayout from "../_components/page-layout";

export default async function Config() {
  const { url, port } = appConfig;
  // const config = appConfig;
  // let paths: HttpResponse<PathList, Error> | undefined;
  // let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined;
  let globalConf: GlobalConf | undefined;
  const api = new Api({ baseUrl: `${url}:${port}` });

  try {
    const mediaMtxConfig = await api.v3.configGlobalGet({ cache: "no-cache" });
    globalConf = mediaMtxConfig?.data;
  } catch {
    console.error("Error reaching MediaMTX at: ", url);
  }
  return (
    <PageLayout header="Global Config">
      <ConfigForm globalConf={globalConf} />
    </PageLayout>
  );
}
