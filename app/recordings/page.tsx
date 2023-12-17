export const dynamic = "force-dynamic";

import GridLayout from "@/app/_components/grid-layout";
import PageLayout from "@/app/_components/page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import getAppConfig from "../_actions/getAppConfig";
import { countFilesInSubdirectories } from "../utils/file-operations";
export default async function Recordings() {
  const config = await getAppConfig();
  if (!config) {
    return <div>Invalid Config</div>;
  }
  let error = false;
  let streamRecordingDirectories: Record<string, number> = {};
  try {
    streamRecordingDirectories = countFilesInSubdirectories(
      config.recordingsDirectory,
    );
  } catch {
    error = true;
  }

  return (
    <PageLayout
      header="Recordings"
      subHeader="Browse your recordings across your various streams"
    >
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Whoops!</AlertTitle>
          <AlertDescription>
            {`There was an issue reading your recordings directory. Please make sure the directory exists.`}
          </AlertDescription>
        </Alert>
      )}
      <GridLayout columnLayout="xs">
        {Object.entries(streamRecordingDirectories).map(([key, value]) => (
          <Card key={key} className="flex items-center">
            <CardHeader className="flex-auto">
              <CardTitle>{key}</CardTitle>
              <CardDescription>{value} Recordings</CardDescription>
            </CardHeader>
            <div className="p-4">
              <Link href={`recordings/${key}`}>
                <Button variant={"outline"}>View Recordings</Button>
              </Link>
            </div>
          </Card>
        ))}
      </GridLayout>
    </PageLayout>
  );
}
