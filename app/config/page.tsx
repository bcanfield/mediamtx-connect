export const dynamic = "force-dynamic";

import appConfig from "@/lib/appConfig";

export default async function Config() {
  const config = appConfig;

  return (
    <div className="flex-auto w-screen flex flex-col">
      <span>{JSON.stringify(config)}</span>
    </div>
  );
}
