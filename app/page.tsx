import api from "@/lib/MediaMTX/api";

import appConfig from "@/lib/appConfig";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";
import StreamCard from "./_components/stream-card";

export default async function Home() {
  const paths = await api.v3.pathsList();
  const mediaMtxConfig = await api.v3.configGlobalGet();
  const { hlsAddress } = mediaMtxConfig.data;
  const { remoteMediaMtxUrl } = appConfig;

  const mtxItems = paths.data.items;
  return (
    <PageLayout header="Online Cams">
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
    </PageLayout>
  );
}
