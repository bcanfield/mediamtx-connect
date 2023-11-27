"use client";
import { Card, CardContent } from "@/components/ui/card";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cam from "./cam";
import { Suspense, useState } from "react";
import Image from "next/image";
import getFirstScreenshot from "../_actions/getFirstScreenshot";
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
    streamName: string;
    hlsAddress?: string;
    readyTime?: string | null;
    thumbnail?: string | null;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onCamSelect = (streamName: string) => {
    // now you got a read/write object
    const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form
    let currentSelectedCams = current.get("liveCams")?.split(",");
    console.log({ current, currentSelectedCams });
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

    // cast to string
    const search = current.toString();
    // or const query = `${'?'.repeat(search.length && 1)}${search}`;
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  const isLive = searchParams
    .get("liveCams")
    ?.split(",")
    .filter(Boolean)
    .includes(props.streamName);
  console.log({ isLive, streamName: props.streamName });
  const [thumbnailError, setThumbnailError] = useState<boolean>(false);

  return (
    <Card className="py-2 flex flex-col">
      <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
        {isLive ? (
          <Cam
            props={{
              address: `${props.remoteMediaMtxUrl}${props.hlsAddress}/${props.streamName}/index.m3u8`,
            }}
          ></Cam>
        ) : thumbnailError ? (
          <ImageIcon className="h-full w-full"></ImageIcon>
        ) : (
          <Image
            className="w-full h-full"
            width={500}
            height={500}
            alt=""
            onError={() => setThumbnailError(true)}
            src={`/api/${props.streamName}/first-screenshot`}
          ></Image>
        )}
      </CardContent>
      <div className="flex gap-2 px-2">
        <Button
          variant={"outline"}
          onClick={() => onCamSelect(props.streamName)}
          className="w-full"
          size={"sm"}
        >
          {isLive ? (
            <VideoOff className="h-4 w-4"></VideoOff>
          ) : (
            <Video className="h-4 w-4"></Video>
          )}
        </Button>

        <Link href={`/recordings/${props.streamName}`} className="flex-auto">
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
                <h4 className="font-medium leading-none">{props.streamName}</h4>
                <p className="text-sm text-muted-foreground">
                  Info about the stream
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-4">
                  <span>Name:</span>
                  <span>{props.streamName}</span>
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
    </Card>
  );
}
