import { StreamRecordingsPage } from '@/features/recordings/browse'

export const dynamic = 'force-dynamic'

export default async function Recordings({
  params,
  searchParams,
}: {
  params: Promise<{ streamname: string }>
  searchParams: Promise<{ take?: number, page?: number }>
}) {
  const { streamname } = await params
  const { take, page } = await searchParams

  return (
    <StreamRecordingsPage
      streamName={streamname}
      page={page}
      take={take}
    />
  )
}
