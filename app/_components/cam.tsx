// import appConfig from "@/lib/appConfig";

export default function Cam({ props }: { props: { address: string } }) {
  //   const camUrl = `${url}${hlsAddress}/${params.name}`;
  console.log({ address: props.address });
  return <iframe className="w-full h-full" src={props.address}></iframe>;
}
