"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cam from "./cam";
import { useState } from "react";
import Image from "next/image";
import { Film, Info, Video, VideoOff, Image as ImageIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

export default function StreamCard({
  props,
}: {
  props: {
    remoteMediaMtxUrl: string;
    streamName?: string;
    hlsAddress?: string;
    readyTime?: string | null;
    thumbnail?: string | null;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [thumbnailError, setThumbnailError] = useState<boolean>(false);

  if (!props.streamName) {
    return <>Error getting stream</>;
  }
  const streamName = props.streamName;
  const onCamSelect = (streamName: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form
    let currentSelectedCams = current.get("liveCams")?.split(",");
    if (currentSelectedCams) {
      if (currentSelectedCams.includes(streamName)) {
        currentSelectedCams = currentSelectedCams.filter(
          (c) => c !== streamName,
        );
      } else {
        currentSelectedCams.push(streamName);
      }
    } else {
      currentSelectedCams = [streamName];
    }

    if (currentSelectedCams.length > 0) {
      current.set("liveCams", currentSelectedCams.join(","));
    } else {
      current.delete("liveCams");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  const isLive = searchParams
    .get("liveCams")
    ?.split(",")
    .filter(Boolean)
    .includes(props.streamName);

  return (
    <Card className="flex flex-col aspect-square">
      <CardHeader className="text-xs">
        <CardDescription>{streamName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-auto justify-between gap-2 ">
        <div className="flex items-center flex-auto w-full border border-red-500">
          {isLive ? (
            <Cam
              props={{
                address: `${props.remoteMediaMtxUrl}${props.hlsAddress}/${streamName}/index.m3u8`,
              }}
            ></Cam>
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

        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() => onCamSelect(streamName)}
            className="w-full"
            size={"sm"}
          >
            {isLive ? (
              <VideoOff className="h-4 w-4"></VideoOff>
            ) : (
              <Video className="h-4 w-4"></Video>
            )}
          </Button>

          <Link href={`/recordings/${streamName}`} className="flex-auto">
            <Button variant={"outline"} className="w-full" size={"sm"}>
              <Film className="h-4 w-4"></Film>
            </Button>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} size={"sm"}>
                <Info className="h-4 w-4"></Info>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">{streamName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Info about the stream
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-4">
                    <span>Name:</span>
                    <span>{streamName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Online:</span>
                    {props.readyTime && (
                      <span>
                        {dayjs(props.readyTime).format("MMMM D, YYYY h:mm A")}
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
