"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export default function DownloadVideo({
  filePath,
  streamName,
}: {
  streamName: string;
  filePath: string;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: "get",
        url: `/api/${streamName}/${filePath}/download-recording`,
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const progress = progressEvent.progress;
          if (progress) {
            setProgress(progress * 100);
          }
        },
      });

      if (response.status === 200) {
        const blob = await response.data;
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
        toast({
          variant: "destructive",
          title: "Error downloading video",
        });
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error downloading video:", error);
      toast({
        variant: "destructive",
        title: "Error downloading video",
      });
    }
    setProgress(0);
    setLoading(false);
  };

  return (
    <Button
      disabled={loading}
      className="w-full"
      variant={"outline"}
      size={"sm"}
      onClick={handleDownload}
    >
      {loading ? (
        <Progress value={progress} className="w-full" />
      ) : (
        <Download className="w-4 h-4"></Download>
      )}
    </Button>
  );
}
