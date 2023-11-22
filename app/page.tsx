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
import { MediaMtxItem, PathsList, pathsList } from "./_actions/mediamtx";

export default async function Home() {
  const recordingsDir = process.env.MEDIAMTX_RECORDINGS_DIR;
  const recordingsDirExists =
    recordingsDir && (await fs.existsSync(recordingsDir));
  const streamRecordingDirectories =
    recordingsDirExists &&
    fs
      .readdirSync(recordingsDir)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
  console.log({ streamRecordingDirectories });
  let paths: PathsList | undefined = undefined;
  try {
    paths = await pathsList();
  } catch {
console.error('Error getting paths')
  }

  interface DashboardItem extends Partial<MediaMtxItem> {
    hasRecordings?: boolean;
  }
  const dashboardItems: DashboardItem[] = paths?.items || [];

  if (streamRecordingDirectories) {
    streamRecordingDirectories.forEach((d) => {
      const matchingIndex = dashboardItems.findIndex((item) => item.name === d);
      if (matchingIndex !== -1) {
        dashboardItems[matchingIndex].hasRecordings = true;
        console.log({ b: dashboardItems[matchingIndex] });
      } else {
        dashboardItems.push({ name: d });
      }
    });
  }

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
                  {" "}
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
