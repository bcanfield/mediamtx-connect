import { Card, CardContent } from "@/components/ui/card";
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
  console.log({ mtxItems });
  return (
    <PageLayout header="Online Cams">
      <GridLayout columnLayout="small">
        {mtxItems?.map(({ name, readyTime }, index) => (
          <Card key={index} className="py-2 flex flex-col">
            <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
              <StreamCard
                props={{
                  streamName: name,
                  readyTime,
                  hlsAddress,
                  remoteMediaMtxUrl,
                }}
              ></StreamCard>
            </CardContent>
          </Card>
        ))}
      </GridLayout>
    </PageLayout>
  );
}
