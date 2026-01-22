export const dynamic = "force-dynamic";

import GridLayout from "@/components/grid-layout";
import PageLayout from "@/components/page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, FolderOpen, Settings, Video } from "lucide-react";
import Link from "next/link";
import getAppConfig from "@/actions/getAppConfig";
import { countFilesInSubdirectories } from "../utils/file-operations";

export default async function Recordings() {
  const config = await getAppConfig();
  if (!config) {
    return (
      <PageLayout
        header="Recordings"
        subHeader="Browse your recordings across your various streams"
      >
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

  let error = false;
  let streamRecordingDirectories: Record<string, number> = {};

  try {
    streamRecordingDirectories = countFilesInSubdirectories(
      config.recordingsDirectory
    );
  } catch {
    error = true;
  }

  const hasRecordings = Object.keys(streamRecordingDirectories).length > 0;

  return (
    <PageLayout
      header="Recordings"
      subHeader="Browse your recordings across your various streams"
    >
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cannot Access Recordings Directory</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Unable to read the recordings directory at{" "}
              <code className="bg-muted px-1 rounded">
                {config.recordingsDirectory}
              </code>
            </p>
            <p className="text-sm">
              Make sure the directory exists and has the correct permissions.
            </p>
            <Link href="/config" className="mt-2 inline-block">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Check Config
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {!error && !hasRecordings && (
        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertTitle>No Recordings Found</AlertTitle>
          <AlertDescription>
            <p>
              No recordings have been saved yet. Recordings will appear here
              once MediaMTX starts recording streams.
            </p>
            <p className="text-sm mt-2">
              Make sure <code className="bg-muted px-1 rounded">MTX_RECORD=yes</code> is
              set in your MediaMTX configuration.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {!error && hasRecordings && (
        <GridLayout columnLayout="xs">
          {Object.entries(streamRecordingDirectories).map(([key, value]) => (
            <Card key={key} className="flex items-center">
              <CardHeader className="flex-auto">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {key}
                </CardTitle>
                <CardDescription>
                  {value} {value === 1 ? "Recording" : "Recordings"}
                </CardDescription>
              </CardHeader>
              <div className="p-4">
                <Link href={`recordings/${key}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </div>
            </Card>
          ))}
        </GridLayout>
      )}
    </PageLayout>
  );
}
