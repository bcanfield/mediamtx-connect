import api from "@/lib/MediaMTX/api";

import appConfig from "@/lib/appConfig";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";
import StreamCard from "./_components/stream-card";

export default async function Home() {
  const paths = await api.v3.pathsList();
  const mediaMtxConfig = await api.v3.configGlobalGet();
  const hlsAddress = mediaMtxConfig.error
    ? undefined
    : mediaMtxConfig.data.hlsAddress;

  const { remoteMediaMtxUrl } = appConfig;

  const mtxItems = mediaMtxConfig.error ? [] : paths.data.items;

  return (
    <PageLayout header="Online Cams">
      {hlsAddress ? (
        <GridLayout columnLayout="small">
          {mtxItems?.map(({ name, readyTime }, index) => (
            <StreamCard
              key={index}
              props={{
                streamName: name,
                readyTime,
                hlsAddress,
                remoteMediaMtxUrl,
              }}
            ></StreamCard>
          ))}
        </GridLayout>
      ) : (
        <span>No HLS Address Configured for Live Viewing</span>
      )}
    </PageLayout>
  );
}
