"use client";

import { useEffect } from "react";

export default function SW() {
  useEffect(() => {
    console.log("in here 1", { navigator });
    if ("serviceWorker" in navigator) {
      console.log("in here 2");
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("service worker installed"))
        .catch((err) => console.error("Error", err));
    }
  }, []);

  return <></>;
}
