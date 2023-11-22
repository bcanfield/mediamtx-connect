

'use client'


export default function Iframe({ camUrl }: {camUrl: string}) {

  return (
    <iframe className="w-full aspect-video" src={camUrl}></iframe>

   
  );
}
