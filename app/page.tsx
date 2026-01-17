export const dynamic = "force-dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { AlertTriangle, Settings } from "lucide-react";
import Link from "next/link";

import getAppConfig from "./_actions/getAppConfig";
import RefreshButton from "./_components/refresh-button";

export default async function Home() {
  const config = await getAppConfig();
  if (!config) {
    return (
      <PageLayout header="Streams" subHeader="Live views of your active streams">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Unable to load configuration. Please check your database connection.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  let paths: HttpResponse<PathList, Error> | undefined;
  let mediaMtxConfig: HttpResponse<GlobalConf, Error> | undefined;
  let connectionError = false;

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  });

  try {
    paths = await api.v3.pathsList();
    mediaMtxConfig = await api.v3.configGlobalGet({ cache: "no-cache" });
  } catch (error) {
    connectionError = true;
    console.error(
      `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
      error
    );
  }

  const remoteMediaMtxUrl = config.remoteMediaMtxUrl;
  const hasStreams = paths?.data.items && paths.data.items.length > 0;
  const isConnected = mediaMtxConfig?.data.hlsAddress && !connectionError;

  return (
    <PageLayout header="Streams" subHeader="Live views of your active streams">
      {connectionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cannot connect to MediaMTX</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Unable to reach MediaMTX at{" "}
              <code className="bg-muted px-1 rounded">
                {config.mediaMtxUrl}:{config.mediaMtxApiPort}
              </code>
            </p>
            <p className="text-sm">
              Make sure MediaMTX is running and the URL is correct in your
              configuration.
            </p>
            <div className="flex gap-2 mt-3">
              <Link href="/config">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Check Config
                </Button>
              </Link>
              <RefreshButton />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!connectionError && !remoteMediaMtxUrl && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configure Remote URL</AlertTitle>
          <AlertDescription>
            <p>
              Set up your Remote MediaMTX URL to view streams in the browser.
              This should be the URL your browser can use to reach MediaMTX.
            </p>
            <Link href="/config" className="mt-2 inline-block">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Go to Config
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !hasStreams && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Active Streams</AlertTitle>
          <AlertDescription>
            MediaMTX is connected but no streams are currently active. Start
            streaming to MediaMTX to see your streams here.
          </AlertDescription>
        </Alert>
      )}

      {isConnected && hasStreams && remoteMediaMtxUrl && (
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
            />
          ))}
        </GridLayout>
      )}
    </PageLayout>
  );
}
