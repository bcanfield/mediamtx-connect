"use client";

import { Button } from "@/components/ui/button";

export default function DownloadVideo({
  filePath,
  streamName,
}: {
  streamName: string;
  filePath: string;
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `/api/download-recording/${streamName}/${filePath}`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video.mp4"; // Specify the downloaded file's name
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Handle error
        console.error(
          "Failed to download video:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error downloading video:", error);
    }
  };

  return (
    <Button variant={"outline"} onClick={handleDownload}>
      Download
    </Button>
  );
}
