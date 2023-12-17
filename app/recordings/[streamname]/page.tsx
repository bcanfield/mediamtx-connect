export const dynamic = "force-dynamic";

import getAppConfig from "@/app/_actions/getAppConfig";
import getScreenshot from "@/app/_actions/getScreenshot";
import getRecordings, {
  StreamRecording,
} from "@/app/_actions/getStreamRecordings";
import GridLayout from "@/app/_components/grid-layout";
import PageLayout from "@/app/_components/page-layout";
import RecordingCard from "@/app/_components/recording-card";
import { getFilesInDirectory } from "@/app/utils/file-operations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import path from "path";
export default async function Recordings({
  params,
  searchParams,
}: {
  params: {
    streamname: string;
  };
  searchParams: { take: number; page: number };
}) {
  const config = await getAppConfig();
  console.log({ config });
  if (!config) {
    return <div>Invalid Config</div>;
  }
  const page = searchParams.page || 1;
  const take = searchParams.take || 10;

  const p = path.join(config.recordingsDirectory, params.streamname);
  console.log({ p });

  const startIndex = (page - 1) * +take;
  const endIndex = startIndex + +take;

  let filesInDirectory: string[] = [];
  let streamRecordings: StreamRecording[] = [];
  let error = false;
  try {
    filesInDirectory = getFilesInDirectory(p);
    streamRecordings = await getRecordings({
      recordingsDirectory: config.recordingsDirectory,
      screenshotsDirectory: config.screenshotsDirectory,
      streamName: params.streamname,
      page: page,
      take: take,
    });
  } catch {
    error = true;
  }

  return (
    <PageLayout header="Recordings" subHeader={params.streamname}>
      {error ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Uh oh!</AlertTitle>
          <AlertDescription>
            {`Could not read recordings directory. Please make sure the directory exists`}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex justify-end text-xs">
          <div className="flex gap-2">
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
      )}

      <GridLayout columnLayout="small">
        {streamRecordings.map(async ({ name, createdAt }) => {
          const base64 = await getScreenshot({
            recordingFileName: name,
            streamName: params.streamname,
          });
          return (
            <RecordingCard
              key={name}
              props={{
                thumbnail: base64,
                createdAt: createdAt,
                fileName: name,
                streamName: params.streamname,
              }}
            ></RecordingCard>
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
