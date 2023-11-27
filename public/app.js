if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(() => console.log("service worker installed"))
    .catch((err) => console.error("Error", err));
}
