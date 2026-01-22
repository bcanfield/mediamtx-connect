export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import ClientConfigForm from "./client-config-form";

export default async function Client() {
  const clientConfig = await prisma.config.findFirst();
  return <ClientConfigForm clientConfig={clientConfig} />;
}
