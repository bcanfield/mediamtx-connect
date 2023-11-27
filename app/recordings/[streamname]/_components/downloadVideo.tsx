"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DownloadVideo({
  filePath,
  streamName,
}: {
  streamName: string;
  filePath: string;
}) {
  const [loading, setLoading] = useState(false);
  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/${streamName}/${filePath}/download-recording`,
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
    setLoading(false);
  };

  return (
    <Button
      disabled={loading}
      className="w-full"
      variant={"outline"}
      onClick={handleDownload}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin"></Loader2>
      ) : (
        <Download className="w-4 h-4"></Download>
      )}
    </Button>
  );
}
