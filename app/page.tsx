import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/MediaMTX/api";
import appConfig from "@/lib/appConfig";
import dayjs from "dayjs";
import { Film, Info, Video, VideoOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import generateScreenshots from "./_actions/screenshots/generate";
import Cam from "./_components/cam";

export default async function Home({
  searchParams,
}: {
  searchParams: { liveCams: string };
}) {
  const { recordingsDirectory, screenshotsDirectory } = appConfig;

  const streamScreenshots = await generateScreenshots({
    recordingsDirectory,
    screenshotsDirectory,
  });

  const paths = await api.v3.pathsList();
  const mediaMtxConfig = await api.v3.configGlobalGet();
  const { hlsAddress } = mediaMtxConfig.data;

  const mtxItems = paths.data.items;

  return (
    <main className="grid sm:grid-cols-2 grid-cols-1 gap-4 ">
      {mtxItems?.map(({ name, readyTime }, index) => {
        const thumbnail = name && streamScreenshots[name][0].base64;
        if (name) {
          return (
            <Card key={index} className="py-2 flex flex-col">
              <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
                {queryIncludes(searchParams.liveCams, name) ? (
                  <Cam
                    props={{
                      address: `${process.env.MEDIAMTX_EXTERNAL_URL}${hlsAddress}/${name}/index.m3u8`,
                    }}
                  ></Cam>
                ) : thumbnail ? (
                  <Image
                    className="w-full h-full"
                    width={500}
                    height={500}
                    alt=""
                    src={thumbnail}
                  ></Image>
                ) : (
                  <span>error getting thumbnail</span>
                )}
              </CardContent>
              <div className="flex gap-2 px-2">
                {queryIncludes(searchParams.liveCams, name) ? (
                  <Link
                    href={{
                      pathname: "/",
                      query: {
                        liveCams: removeItemFromQuery(
                          searchParams.liveCams,
                          name,
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
                        liveCams: addItemToQuery(searchParams.liveCams, name),
                      },
                    }}
                    className="flex-auto border"
                  >
                    <Button variant={"outline"} className="w-full" size={"sm"}>
                      <Video className="h-4 w-4"></Video>
                    </Button>
                  </Link>
                )}

                <Link href={`/recordings/${name}`} className="flex-auto">
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
                        <h4 className="font-medium leading-none">{name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Info about the stream
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-4">
                          <span>Name:</span>
                          <span>{name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Online:</span>
                          <span>
                            {dayjs(readyTime).format("MMMM D, YYYY h:mm A")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </Card>
          );
        }
      })}
    </main>
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
