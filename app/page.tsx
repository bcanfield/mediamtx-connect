export const dynamic = "force-dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import appConfig from "@/lib/appConfig";
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

export default async function Home() {
  const { remoteMediaMtxUrl, url, port } = appConfig;

  let paths: HttpResponse<PathList, Error> | undefined;
  let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined;
  const api = new Api({ baseUrl: `${url}:${port}` });

  try {
    paths = await api.v3.pathsList();
    mediaMtxConfig = await api.v3.configGlobalGet({ cache: "no-cache" });
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
