import fs from "fs";

import GridLayout from "@/app/_components/grid-layout";
import PageLayout from "@/app/_components/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import appConfig from "@/lib/appConfig";
import { redirect } from "next/navigation";
import { countFilesInSubdirectories } from "../utils/file-operations";
export default async function Recordings({
  params,
}: {
  params: {
    streamname: string;
  };
}) {
  const { recordingsDirectory } = appConfig;
  if (!fs.existsSync(recordingsDirectory)) {
    redirect("/");
  }
  const streamRecordingDirectories =
    countFilesInSubdirectories(recordingsDirectory);

  return (
    <PageLayout header="Recordings" subHeader={params.streamname}>
      <GridLayout columnLayout="xs">
        {Object.entries(streamRecordingDirectories).map(([key, value]) => (
          <Card key={key} className="flex items-center">
            <CardHeader className="flex-auto">
              <CardTitle>{key}</CardTitle>
              <CardDescription>{value} Recordings</CardDescription>
            </CardHeader>
            <div className="p-4">
              <Button variant={"outline"}>View Recordings</Button>
            </div>
          </Card>
        ))}
      </GridLayout>
    </PageLayout>
  );
}
