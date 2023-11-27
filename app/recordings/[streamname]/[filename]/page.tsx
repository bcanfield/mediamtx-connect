import PageLayout from "@/app/_components/page-layout";
export default async function Recording({
  params,
}: {
  params: {
    streamname: string;
    filename: string;
  };
}) {
  return (
    <PageLayout
      header="Recording"
      subHeader={`${params.streamname} - ${params.filename}`}
    >
      <video
        autoPlay
        controls
        src={`/api/${params.streamname}/${params.filename}/view-recording`}
      ></video>
    </PageLayout>
  );
}
