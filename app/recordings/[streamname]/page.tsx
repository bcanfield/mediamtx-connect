import fs from "fs";

import generateScreenshots from "@/app/_actions/screenshots/generate";
import appConfig from "@/lib/appConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import GridLayout from "@/app/_components/grid-layout";
import PageLayout from "@/app/_components/page-layout";
import { getFilesInDirectory } from "@/app/utils/file-operations";
import path from "path";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Link from "next/link";
import DownloadVideo from "@/app/recordings/[streamname]/_components/downloadVideo";
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
  const take = searchParams.take || 10;

  const p = path.join(recordingsDirectory, params.streamname);
  console.log({ p });
  const filesInDirectory = getFilesInDirectory(p);

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  const streamScreenshots = await generateScreenshots({
    recordingsDirectory,
    screenshotsDirectory,
    streamName: params.streamname,
    page: page,
    take: take,
  });

  return (
    <PageLayout header="Recordings" subHeader={params.streamname}>
      <div className="flex justify-end text-xs">
        <div className="flex  gap-2">
          <Link href={{ query: { page: +page > 0 ? +page - 1 : 0 } }}>
            <ChevronLeft className="w-4 h-4"></ChevronLeft>
          </Link>
          {`Showing ${startIndex} - ${endIndex} of ${filesInDirectory.length}`}
          <Link href={{ query: { page: +page + 1 } }}>
            <ChevronRight className="w-4 h-4"></ChevronRight>
          </Link>
        </div>
      </div>
      <GridLayout columnLayout="medium">
        {Object.entries(streamScreenshots).map(([key, value]) =>
          value.map(({ base64, date, recordingFileName }) => (
            <Card key={key} className="flex flex-col">
              <CardHeader>
                <CardDescription className="text-xs">
                  {date && (
                    <span>
                      {dayjs(date).format("dddd, MMMM D, YYYY h:mm A")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 flex-auto">
                {base64 ? (
                  <Image
                    className="flex-auto"
                    width={500}
                    height={500}
                    alt=""
                    src={base64}
                  ></Image>
                ) : (
                  <div className="border flex-auto flex items-center justify-center">
                    <ImageOff></ImageOff>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <DownloadVideo
                  streamName={params.streamname}
                  filePath={recordingFileName}
                ></DownloadVideo>
              </CardFooter>
            </Card>
          )),
        )}
      </GridLayout>
    </PageLayout>
  );
}
