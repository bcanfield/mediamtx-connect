"use client";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function Cam({ props }: { props: { address: string } }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    console.log({ address: props.address });
    if (!videoRef.current || !props.address) {
      return;
    }

    if (!Hls.isSupported()) {
      videoRef.current.src = props.address;
      return;
    }

    const hls = new Hls();
    hls.loadSource(props.address);
    hls.attachMedia(videoRef.current);

    return () => {
      console.log("hls destroy");
      hls.destroy();
    };
  }, [props.address]);
  return <video ref={videoRef} autoPlay controls />;
}
