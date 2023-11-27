import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/MediaMTX/api";

import dayjs from "dayjs";
import { Film, Info, Video, VideoOff, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import getFirstScreenshot from "./_actions/getFirstScreenshot";
import Cam from "./_components/cam";
import GridLayout from "./_components/grid-layout";
import PageLayout from "./_components/page-layout";
import StreamCard from "./_components/stream-card";
import appConfig from "@/lib/appConfig";

export default async function Home({
  searchParams,
}: {
  searchParams: { liveCams: string };
}) {
  const paths = await api.v3.pathsList();
  const mediaMtxConfig = await api.v3.configGlobalGet();
  const { hlsAddress } = mediaMtxConfig.data;
  const { remoteMediaMtxUrl } = appConfig;

  const mtxItems = paths.data.items;

  return (
    <PageLayout header="Online Cams">
      <GridLayout columnLayout="small">
        {mtxItems
          ?.filter((i) => !!i.name)
          .map(({ name, readyTime }, index) => (
            <Card key={index} className="py-2 flex flex-col">
              <CardContent className="flex flex-col gap-2 flex-auto min-h-[20rem]">
                <StreamCard
                  props={{
                    streamName: name,
                    readyTime,
                    hlsAddress,
                    remoteMediaMtxUrl,
                  }}
                ></StreamCard>
              </CardContent>
            </Card>
          ))}
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
