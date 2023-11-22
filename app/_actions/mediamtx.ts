"use server";

const mediaMtxUrl = process.env.MEDIAMTX_API_URL;

export interface MediaMtxItem {
  name: string;
  confName: string;
  source: { type: string; id: string };
  ready: boolean;
  readyTime: string;
  tracks: string[];
  bytesReceived: number;
  readers: { type: string; id: string }[];
}
export interface PathsList {
  itemCount: number;
  pageCount: number;
  items: MediaMtxItem[];
}
export async function pathsList() {
  if (!mediaMtxUrl) {
    throw new Error("No MediaMTX URL Configured");
  }
  const res = await fetch(`${mediaMtxUrl}:9997/v3/paths/list`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const response: Promise<PathsList> = res.json();
  return response;
}
