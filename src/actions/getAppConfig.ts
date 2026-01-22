"use server";

import prisma from "@/lib/prisma";
import { Config } from "@prisma/client";

export default async function getAppConfig(): Promise<Config | null> {
  return await prisma.config.findFirst();
}
