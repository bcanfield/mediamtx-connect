"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import {
  Image as ImageIcon,
  Info,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DownloadVideo from "../recordings/[streamname]/_components/downloadVideo";

export default function RecordingCard({
  props,
}: {
  props: {
    streamName?: string;
    fileName?: string;
    thumbnail?: string | null;
    createdAt: Date;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [thumbnailError, setThumbnailError] = useState<boolean>(false);

  if (!props.streamName || !props.fileName) {
    return <>Error getting stream</>;
  }
  const streamName = props.streamName;
  const fileName = props.fileName;
  const onCamSelect = (fileName: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form
    let currentSelectedCams = current.get("liveCams")?.split(",");
    if (currentSelectedCams) {
      if (currentSelectedCams.includes(fileName)) {
        currentSelectedCams = currentSelectedCams.filter((c) => c !== fileName);
      } else {
        currentSelectedCams.push(fileName);
      }
    } else {
      currentSelectedCams = [fileName];
    }

    if (currentSelectedCams.length > 0) {
      current.set("liveCams", currentSelectedCams.join(","));
    } else {
      current.delete("liveCams");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`, { scroll: false });
  };

  const isLive = searchParams
    .get("liveCams")
    ?.split(",")
    .filter(Boolean)
    .includes(fileName);

  console.log({ fileName });
  return (
    <Card className="flex flex-col aspect-square">
      <CardHeader className="text-xs">
        <CardDescription>{streamName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-auto justify-between gap-2 ">
        <div className="flex items-center flex-auto w-full ">
          {isLive ? (
            <video
              className="w-full"
              autoPlay
              controls
              playsInline
              src={`/api/${props.streamName}/${props.fileName}/view-recording`}
            ></video>
          ) : thumbnailError ? (
            <div className="flex items-center justify-center  w-full h-full">
              <ImageIcon className="h-12 w-12"></ImageIcon>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <Image
                alt=""
                fill
                objectFit="contain"
                onError={() => setThumbnailError(true)}
                src={`/api/${streamName}/first-screenshot`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant={"outline"}
            onClick={() => onCamSelect(fileName)}
            className="basis-1/2"
            size={"sm"}
          >
            {isLive ? (
              <PauseCircle className="h-4 w-4  animate-pulse"></PauseCircle>
            ) : (
              <PlayCircle className="h-4 w-4"></PlayCircle>
            )}
          </Button>

          <div className="basis-1/4">
            <DownloadVideo
              streamName={streamName}
              filePath={fileName}
            ></DownloadVideo>
          </div>

          <Popover>
            <PopoverTrigger asChild className="basis-1/4">
              <Button variant={"outline"} size={"sm"}>
                <Info className="h-4 w-4"></Info>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-md text-muted-foreground">Recording</p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-4">
                    <span>Name:</span>
                    <span>{fileName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Created:</span>
                    {props.createdAt && (
                      <span>
                        {dayjs(props.createdAt).format("MMMM D, YYYY h:mm A")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
