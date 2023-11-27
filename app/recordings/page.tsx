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
import Link from "next/link";
export default async function Recordings() {
  const { recordingsDirectory } = appConfig;
  if (!fs.existsSync(recordingsDirectory)) {
    redirect("/");
  }
  const streamRecordingDirectories =
    countFilesInSubdirectories(recordingsDirectory);

  return (
    <PageLayout header="Recordings">
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
