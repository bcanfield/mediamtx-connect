import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dayjs from "dayjs";
import fs from "fs";
import { Video } from "lucide-react";
import Link from "next/link";
import { MtxItem, MtxPathsList, mtxPathsList } from "./_actions/mediamtx/paths";
import { appConfig } from "./_actions/mediamtx/globalConfig";

export default async function Home() {
  // const mediaMtxContext = useContext(MediaMtxContext);
  const { recordingsDirectory, url, apiAddress } = await appConfig();

  // Get MTX Recording Directories
  const recordingsDirExists = await fs.existsSync(recordingsDirectory);
  const streamRecordingDirectories =
    recordingsDirExists && recordingsDirExists
      ? fs
          .readdirSync(recordingsDirectory)
          .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      : [];

  // Get Online MTX Streams
  let mtxItems: MtxPathsList["items"] = [];
  try {
    const paths = await mtxPathsList({ mediaMtxUrl: `${url}${apiAddress}` });
    mtxItems = paths.items;
  } catch {
    console.error("Error getting paths");
  }

  const dashboardItems: DashboardItem[] = mtxItems;

  // Attempt to create dashboard items by matching available recording directories with online mtx items
  // This is necessary in the case where the cam is offline but we want to still see the recordings
  streamRecordingDirectories.forEach((d) => {
    const mtxItemIndex = mtxItems.findIndex((item) => item.name === d);
    if (mtxItemIndex !== -1) {
      dashboardItems[mtxItemIndex].hasRecordings = true;
    } else {
      dashboardItems.push({ name: d });
    }
  });

  return (
    <main className="flex flex-col w-full h-full gap-4 items-center p-2">
      {dashboardItems.map(({ name, readyTime, hasRecordings }, index) => (
        <Card key={name} className="flex flex-col p-2 items-center w-full">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>
              {readyTime
                ? `Online since: ${dayjs(readyTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}`
                : `Not Online`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Video className="w-12 h-12"></Video>
          </CardContent>
          <CardFooter>
            <div className="flex gap-4 w-full">
              <Button
                disabled={!hasRecordings}
                variant="outline"
                className="flex-1"
              >
                <Link
                  key={`Cam-${index}`}
                  href={{
                    pathname: `cam/${name}/recordings`,
                    query: { page: 1, take: 5 },
                  }}
                >
                  Recordings
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={!readyTime}
              >
                <Link key={`Cam-${index}`} href={`cam/${name}/live`}>
                  Live View
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </main>
  );
}

interface DashboardItem extends Partial<MtxItem> {
  hasRecordings?: boolean;
}
