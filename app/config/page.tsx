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
    <div className="flex flex-col gap-4 px-4">
      <header id="header" className="relative z-2">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Global Config</h2>
        </div>
      </header>
      <ConfigForm globalConf={globalConf} />
    </div>
  );
}
