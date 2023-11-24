import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import dayjs from "dayjs";
import fs from "fs";
import Image from "next/image";
import Link from "next/link";
import { appConfig } from "./_actions/mediamtx/globalConfig";
import { MtxItem, MtxPathsList, mtxPathsList } from "./_actions/mediamtx/paths";
import generateScreenshots from "./_actions/screenshots/generate";

export default async function Home() {
  const { recordingsDirectory, url, apiAddress, screenshotsDirectory } =
    await appConfig();

  const streamScreenshots = await generateScreenshots({
    recordingsDirectory,
    screenshotsDirectory,
  });

  // Get Online MTX Streams
  let mtxItems: MtxPathsList["items"] = [];
  try {
    const paths = await mtxPathsList({ mediaMtxUrl: `${url}${apiAddress}` });
    mtxItems = paths.items;
  } catch {
    console.error("Error getting paths");
  }

  const dashboardItems: DashboardItem[] = [];

  mtxItems.forEach((mtxItem) => {
    if (
      streamScreenshots[mtxItem.name] &&
      streamScreenshots[mtxItem.name].length > 0
    ) {
      const imageData = fs.readFileSync(streamScreenshots[mtxItem.name][0]);
      const base64Image = imageData
        ? Buffer.from(imageData).toString("base64")
        : undefined;

      dashboardItems.push({
        ...mtxItem,
        thumbnail: base64Image,
      });
    } else {
      dashboardItems.push({ ...mtxItem });
    }
  });

  return (
    <main className="grid grid-cols-2 gap-4">
      {dashboardItems.map(({ name, readyTime, thumbnail }, index) => (
        <Card key={name}>
          <CardHeader>
            <CardDescription>
              {readyTime
                ? `Online since: ${dayjs(readyTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}`
                : `Not Online`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              width={500}
              height={500}
              alt=""
              src={`data:image/png;base64,${thumbnail}`}
            ></Image>
          </CardContent>
          <CardFooter>
            <div className="flex gap-4 w-full">
              <Button
                disabled={!thumbnail}
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
  thumbnail?: string;
}
