import getScreenshot from "@/app/_actions/getScreenshot";
import getRecordings from "@/app/_actions/getStreamRecordings";
import GridLayout from "@/app/_components/grid-layout";
import PageLayout from "@/app/_components/page-layout";
import { getFilesInDirectory } from "@/app/utils/file-operations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import appConfig from "@/lib/appConfig";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import { Url } from "next/dist/shared/lib/router/router";
import Image from "next/image";
import Link from "next/link";
import path from "path";
import DownloadVideo from "./_components/downloadVideo";
import { Button } from "@/components/ui/button";
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

  const page = searchParams.page || 1;
  const take = searchParams.take || 10;

  const p = path.join(recordingsDirectory, params.streamname);
  console.log({ p });
  const filesInDirectory = getFilesInDirectory(p);

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  const streamRecordings = await getRecordings({
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
          <LinkWrapper
            href={{ query: { page: +page > 0 ? +page - 1 : 0 } }}
            disabled={+page === 1}
          >
            <ChevronLeft className="w-4 h-4"></ChevronLeft>
          </LinkWrapper>
          {`Showing ${startIndex} - ${Math.min(
            endIndex,
            filesInDirectory.length,
          )} of ${filesInDirectory.length}`}
          <LinkWrapper
            href={{ query: { page: +page + 1 } }}
            disabled={endIndex >= filesInDirectory.length}
          >
            <ChevronRight className="w-4 h-4"></ChevronRight>
          </LinkWrapper>
        </div>
      </div>
      <GridLayout columnLayout="medium">
        {streamRecordings.map(async ({ name, createdAt }) => {
          const base64 = await getScreenshot({
            recordingFileName: name,
            streamName: params.streamname,
          });
          return (
            <Card key={name} className="flex flex-col">
              <CardHeader>
                <CardDescription className="text-xs">
                  <span>
                    {dayjs(createdAt).format("dddd, MMMM D, YYYY h:mm A")}
                  </span>
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
                    <ImageIcon></ImageIcon>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <div className="flex-1">
                  <DownloadVideo
                    streamName={params.streamname}
                    filePath={name}
                  ></DownloadVideo>
                </div>
                <Link className="flex-1" href={`${params.streamname}/${name}`}>
                  <Button className="w-full" variant="outline">
                    <Play className="w-4 h-4"></Play>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </GridLayout>
    </PageLayout>
  );
}

const LinkWrapper = ({
  href,
  children,
  disabled = false,
}: {
  href: Url;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  if (disabled) {
    return <div className="text-secondary">{children}</div>;
  }
  return <Link href={href}>{children}</Link>;
};
