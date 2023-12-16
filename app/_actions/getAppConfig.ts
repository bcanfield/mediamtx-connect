"use server";

import prisma from "@/lib/prisma";

export default async function getAppConfig() {
  return await prisma.config.findFirst();
}
