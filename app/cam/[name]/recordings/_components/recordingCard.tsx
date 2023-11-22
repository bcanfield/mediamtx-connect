

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import DownloadVideo from "./downloadVideo";
export default function RecordingCard({
  filePath,
  imageData,
}: {
  filePath: string;
  imageData?: Buffer;
}) {


  const base64Image = imageData ? Buffer.from(imageData).toString('base64') : undefined;
  return (
    <Card className="flex flex-col items-center w-full">
    <CardHeader>
      {/* <CardTitle>{name}</CardTitle> */}
      <CardDescription>
      {filePath}
      </CardDescription>
    </CardHeader>
    <CardContent>
    {base64Image && (
        <img src={`data:image/png;base64,${base64Image}`}></img>
      )}    </CardContent>
    <CardFooter>
      <div className="flex gap-4 w-full">
      <DownloadVideo filePath={filePath}></DownloadVideo>
      </div>
    </CardFooter>
  </Card>

    // <div>
    //   <span>{filePath}</span>
    //   {base64Image && (
    //     <img src={`data:image/png;base64,${base64Image}`}></img>
    //   )}
    //   <DownloadVideo filePath={filePath}></DownloadVideo>
    //   {/* <button onClick={handleDownload}>Download Video</button> */}
    // </div>
  );
}
