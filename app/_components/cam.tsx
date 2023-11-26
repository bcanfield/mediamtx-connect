"use client";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function Cam({ props }: { props: { address: string } }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const create = (video: HTMLVideoElement) => {
      const hls = new Hls({
        maxLiveSyncPlaybackRate: 1.5,
      });

      hls.on(Hls.Events.ERROR, (evt, data) => {
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          console.log("recovering hls error");

          hls.recoverMediaError();
        } else if (data.fatal) {
          console.log("fatal hls error");

          hls.destroy();
          setTimeout(() => create(video), 2000);
        }
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("media attached");
        hls.loadSource(props.address);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("manifest parsed");
        video.play();
      });

      hls.attachMedia(video);
      return hls;
    };

    if (!videoRef.current || !props.address) {
      return;
    }

    if (!Hls.isSupported()) {
      videoRef.current.src = props.address;
      return;
    }
    const hls = create(videoRef.current);
    return () => {
      console.log("hls destroy");
      hls?.destroy();
    };
  }, [props.address]);
  return (
    <video
      className="w-full h-full"
      ref={videoRef}
      muted={true}
      autoPlay
      controls
    />
  );
}
