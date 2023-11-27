import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/MediaMTX/api";
import dayjs from "dayjs";
import { Film, Info, Video, VideoOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import getFirstScreenshot from "./_actions/getFirstScreenshot";
import Cam from "./_components/cam";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";

export default async function Home({
  searchParams,
}: {
  searchParams: { liveCams: string };
}) {
  const paths = await api.v3.pathsList();
  const mediaMtxConfig = await api.v3.configGlobalGet();
  const { hlsAddress } = mediaMtxConfig.data;

  const mtxItems = paths.data.items;

  const StreamCard = async ({
    props,
  }: {
    props: {
      streamName: string;
      hlsAddress?: string;
      readyTime?: string | null;
    };
  }) => {
    const thumbnail = await getFirstScreenshot({
      streamName: props.streamName,
    });
    return (
      <Card className="py-2 flex flex-col">
        <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
          {queryIncludes(searchParams.liveCams, props.streamName) ? (
            <Cam
              props={{
                address: `${process.env.MEDIAMTX_EXTERNAL_URL}${hlsAddress}/${props.streamName}/index.m3u8`,
              }}
            ></Cam>
          ) : !thumbnail ? (
            <span>blah</span>
          ) : (
            <Image
              className="w-full h-full"
              width={500}
              height={500}
              alt=""
              src={thumbnail}
            ></Image>
          )}
        </CardContent>
        <div className="flex gap-2 px-2">
          {queryIncludes(searchParams.liveCams, props.streamName) ? (
            <Link
              href={{
                pathname: "/",
                query: {
                  liveCams: removeItemFromQuery(
                    searchParams.liveCams,
                    props.streamName,
                  ),
                },
              }}
              className="flex-auto"
            >
              <Button variant={"outline"} className="w-full" size={"sm"}>
                <VideoOff className="h-4 w-4"></VideoOff>
              </Button>
            </Link>
          ) : (
            <Link
              href={{
                pathname: "/",
                query: {
                  liveCams: addItemToQuery(
                    searchParams.liveCams,
                    props.streamName,
                  ),
                },
              }}
              className="flex-auto border"
            >
              <Button variant={"outline"} className="w-full" size={"sm"}>
                <Video className="h-4 w-4"></Video>
              </Button>
            </Link>
          )}

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
                  <h4 className="font-medium leading-none">
                    {props.streamName}
                  </h4>
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
  };

  return (
    <PageLayout header="Online Cams">
      <GridLayout columnLayout="small">
        {mtxItems?.map(({ name, readyTime }, index) => {
          if (name) {
            return (
              <Card key={index} className="py-2 flex flex-col">
                <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
                  <StreamCard
                    props={{ streamName: name, readyTime }}
                  ></StreamCard>
                </CardContent>
              </Card>
            );
          }
        })}
      </GridLayout>
    </PageLayout>
  );
}

// Function to add an item to the query parameter
const addItemToQuery = (existingQuery: string | undefined, newItem: string) => {
  if (existingQuery) {
    const itemsArray = existingQuery.split(",").filter(Boolean); // Convert to an array

    if (!itemsArray.includes(newItem)) {
      itemsArray.push(newItem); // Add the new item if it's not already present
    }
    return itemsArray.join(","); // Convert back to a comma-separated string
  }
  return newItem;
};

// Function to remove an item from the query parameter
const removeItemFromQuery = (existingQuery: string, itemToRemove: string) => {
  const itemsArray = existingQuery.split(",").filter(Boolean); // Convert to an array

  const updatedItems = itemsArray
    .filter((item) => item !== itemToRemove)
    .join(",");

  return updatedItems;
};

// Function to remove an item from the query parameter
const queryIncludes = (existingQuery: string, itemToCheck: string) => {
  if (!existingQuery) return false;
  const itemsArray = existingQuery.split(",").filter(Boolean); // Convert to an array

  return itemsArray.includes(itemToCheck);
};
