import fs from "fs";

import generateScreenshots from "@/app/_actions/screenshots/generate";
import appConfig from "@/lib/appConfig";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
export default async function Recordings({
  params,
  searchParams,
}: {
  params: {
    streamname: string;
  };
  searchParams: { take: number; page: number };
}) {
  const { recordingsDirectory, screenshotsDirectory } = appConfig;
  // Check if the directory exists
  if (!fs.existsSync(screenshotsDirectory)) {
    // If it doesn't exist, create it
    fs.mkdirSync(screenshotsDirectory);
    console.log("Screenshots Directory created successfully.");
  } else {
    console.log("Screenshots Directory already exists.");
  }

  const page = searchParams.page || 1;
  const take = searchParams.take || 5;

  console.log({ brandinsssss: params.streamname });
  const streamScreenshots = await generateScreenshots({
    recordingsDirectory,
    screenshotsDirectory,
    streamName: params.streamname,
    page: page,
    take: take,
  });

  return (
    <main className="grid sm:grid-cols-2 grid-cols-1 gap-4 ">
      {Object.entries(streamScreenshots).map(([key, value]) =>
        value.map(({ base64, date }) => (
          <Card key={key} className="py-2 flex flex-col">
            <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
              {date && (
                <span>{dayjs(date).format("dddd, MMMM D, YYYY h:mm A")}</span>
              )}

              {base64 ? (
                <Image
                  className="w-full h-full"
                  width={500}
                  height={500}
                  alt=""
                  src={base64}
                ></Image>
              ) : (
                "er"
              )}
            </CardContent>
          </Card>
        )),
      )}
    </main>
  );
}
