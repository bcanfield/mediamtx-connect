import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import api from "@/lib/MediaMTX/api";
import appConfig from "@/lib/appConfig";
import dayjs from "dayjs";
import fs from "fs";
import Image from "next/image";
import generateScreenshots from "./_actions/screenshots/generate";

export default async function Home() {
  const { recordingsDirectory, screenshotsDirectory } = appConfig;

  const streamScreenshots = await generateScreenshots({
    recordingsDirectory,
    screenshotsDirectory,
  });

  const paths = await api.v3.pathsList();
  const mtxItems = paths.data.items;

  const getThumbnail = (streamName: string) => {
    if (
      streamScreenshots[streamName] &&
      streamScreenshots[streamName].length > 0
    ) {
      const imageData = fs.readFileSync(streamScreenshots[streamName][0]);
      const base64Image = imageData
        ? Buffer.from(imageData).toString("base64")
        : undefined;
      return `data:image/png;base64,${base64Image}`;
    }
  };

  return (
    <main className="grid grid-cols-2 gap-4">
      {mtxItems?.map(({ name, readyTime }, index) => {
        const thumbnail = name && getThumbnail(name);
        if (name) {
          return (
            <Card key={index}>
              <CardHeader>
                <CardDescription>
                  {readyTime
                    ? `Online since: ${dayjs(readyTime).format(
                        "YYYY-MM-DD HH:mm:ss",
                      )}`
                    : `Not Online`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thumbnail ? (
                  <Image
                    width={500}
                    height={500}
                    alt=""
                    src={thumbnail}
                  ></Image>
                ) : (
                  <span>error getting thumbnail</span>
                )}
              </CardContent>
            </Card>
          );
        }
      })}
    </main>
  );
}
