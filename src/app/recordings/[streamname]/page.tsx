export const dynamic = "force-dynamic";

import getAppConfig from "@/actions/getAppConfig";
import getRecordings, {
  StreamRecording,
} from "@/actions/getStreamRecordings";
import GridLayout from "@/components/grid-layout";
import PageLayout from "@/components/page-layout";
import RecordingCard from "@/components/recording-card";
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
  params: Promise<{ streamname: string }>;
  searchParams: Promise<{ take?: number; page?: number }>;
}) {
  const { streamname } = await params;
  const { take: takeParam, page: pageParam } = await searchParams;

  const config = await getAppConfig();
  console.log({ config });
  if (!config) {
    return <div>Invalid Config</div>;
  }

  const page = pageParam || 1;
  const take = takeParam || 10;

  const p = path.join(config.recordingsDirectory, streamname);
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
      streamName: streamname,
      page: page,
      take: take,
    });
  } catch {
    error = true;
  }

  return (
    <PageLayout
      header="Recordings"
      subHeader={`Recordings for: ${streamname}`}
    >
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
        {streamRecordings.map(({ name, createdAt, base64, fileSize }) => (
          <RecordingCard
            key={name}
            props={{
              thumbnail: base64,
              createdAt: createdAt,
              fileName: name,
              streamName: streamname,
              fileSize,
            }}
          ></RecordingCard>
        ))}
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
