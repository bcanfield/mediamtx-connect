import { appConfig } from "../_actions/mediamtx/globalConfig";

export default async function Config() {
  const config = await appConfig();

  //   const camUrl = `${url}${hlsAddress}/${params.name}`;
  return (
    <div className="flex-auto w-screen flex flex-col">
      <span>{JSON.stringify(config)}</span>
    </div>
  );
}
