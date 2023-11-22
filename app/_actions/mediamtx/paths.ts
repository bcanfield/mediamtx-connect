"use server";

export interface MtxItem {
  name: string;
  confName: string;
  source: { type: string; id: string };
  ready: boolean;
  readyTime: string;
  tracks: string[];
  bytesReceived: number;
  readers: { type: string; id: string }[];
}
export interface MtxPathsList {
  itemCount: number;
  pageCount: number;
  items: MtxItem[];
}
export async function mtxPathsList({ mediaMtxUrl }: { mediaMtxUrl: string }) {
  const res = await fetch(`${mediaMtxUrl}/v3/paths/list`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const response: Promise<MtxPathsList> = res.json();
  return response;
}
