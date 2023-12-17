export const dynamic = "force-dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";
import StreamCard from "./_components/stream-card";
import {
  Api,
  Error,
  GlobalConf,
  HttpResponse,
  PathList,
} from "@/lib/MediaMTX/generated";
import { AlertTriangle } from "lucide-react";

import getAppConfig from "./_actions/getAppConfig";

export default async function Home() {
  const config = await getAppConfig();
  if (!config) {
    return <div>Invalid Config</div>;
  }

  let paths: HttpResponse<PathList, Error> | undefined;
  let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined;
  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  });

  try {
    paths = await api.v3.pathsList();
    mediaMtxConfig = await api.v3.configGlobalGet({ cache: "no-cache" });
  } catch {
    console.error("Error reaching MediaMTX at: ", config.mediaMtxUrl);
  }

  const remoteMediaMtxUrl = config.remoteMediaMtxUrl;

  return (
    <PageLayout header="Streams" subHeader="Live views of your active streams">
      {!paths?.data.items !== undefined && paths?.data.items?.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Set up some streams!</AlertTitle>
          <AlertDescription>
            {`No live streams detected. Add some streams to MediaMTX to view`}
          </AlertDescription>
        </Alert>
      )}
      {!remoteMediaMtxUrl && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Set up your Remote MediaMTX Url!</AlertTitle>
          <AlertDescription>
            {`Head over to the config page. You need to set up your remote MediaMTX Url to view your streams`}
          </AlertDescription>
        </Alert>
      )}
      {mediaMtxConfig?.data.hlsAddress && remoteMediaMtxUrl !== null ? (
        <GridLayout columnLayout="small">
          {paths?.data.items?.map(({ name, readyTime }, index) => (
            <StreamCard
              key={index}
              props={{
                streamName: name,
                readyTime,
                hlsAddress: mediaMtxConfig?.data.hlsAddress,
                remoteMediaMtxUrl: remoteMediaMtxUrl,
              }}
            ></StreamCard>
          ))}
        </GridLayout>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            {`We couldn't reach the MediaMTX server. Please check the url in your
            configuration`}
          </AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
}
