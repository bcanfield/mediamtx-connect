import { appConfig } from "@/app/_actions/mediamtx/globalConfig";

export default async function Cam({ params }: { params: { name: string } }) {
  const { url, hlsAddress } = await appConfig();

  const camUrl = `${url}${hlsAddress}/${params.name}`;
  return (
    <div className="flex-auto w-screen flex flex-col">
      <div className="w-full h-1/2 relative">
        <iframe className="w-full aspect-video" src={camUrl}></iframe>
      </div>
    </div>
  );
}
