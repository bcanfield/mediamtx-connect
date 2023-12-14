export const dynamic = "force-dynamic";

import { Api, GlobalConf } from "@/lib/MediaMTX/generated";
import appConfig from "@/lib/appConfig";
import ConfigForm from "./config-form";

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
    <div className="border border-red-500 px-4">
      <ConfigForm globalConf={globalConf} />
    </div>
  );
}
