"use server";

import prisma from "@/lib/prisma";
import { Config } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function updateClientConfig({
  clientConfig,
}: {
  clientConfig: Config;
}): Promise<boolean> {
  console.log("Updating Client Config");

  try {
    const updated = await prisma.config.update({
      where: {
        id: clientConfig.id,
      },
      data: clientConfig,
    });
    console.log({ updated });
    revalidatePath("/");
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}
