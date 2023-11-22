import Iframe from "./_components/iframe";

export default function Cam({ params }: { params: { name: string } }) {
  const mediaMtxUrl = process.env.MEDIAMTX_API_URL;
  const location = `${mediaMtxUrl}:8888/${params.name}`;
  return (
    <div className="flex-auto w-screen flex flex-col">
      <div className="w-full h-1/2 relative">
        <Iframe camUrl={location}></Iframe>
      </div>
    </div>
  );
}
