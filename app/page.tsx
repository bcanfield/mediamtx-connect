import api from "@/lib/MediaMTX/api";

import appConfig from "@/lib/appConfig";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";
import StreamCard from "./_components/stream-card";
import {
  Error,
  GlobalConf,
  HttpResponse,
  PathList,
} from "@/lib/MediaMTX/generated";

export default async function Home() {
  const { remoteMediaMtxUrl, url } = appConfig;

  let paths: HttpResponse<PathList, Error> | undefined;
  let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined;
  try {
    paths = await api.v3.pathsList();
    mediaMtxConfig = await api.v3.configGlobalGet();
  } catch {
    console.error("Error reaching MediaMTX at: ", url);
  }

  return (
    <PageLayout header="Online Cams">
      {mediaMtxConfig?.data.hlsAddress ? (
        <GridLayout columnLayout="small">
          {paths?.data.items?.map(({ name, readyTime }, index) => (
            <StreamCard
              key={index}
              props={{
                streamName: name,
                readyTime,
                hlsAddress: mediaMtxConfig?.data.hlsAddress,
                remoteMediaMtxUrl,
              }}
            ></StreamCard>
          ))}
        </GridLayout>
      ) : (
        <span>Could not retrieve HLS Address from MediaMTX</span>
      )}
    </PageLayout>
  );
}
