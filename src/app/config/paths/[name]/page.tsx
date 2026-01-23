import { PathConfigPage } from '@/features/streams/paths'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    name: string
  }>
}

export default async function EditPathPage({ params }: PageProps) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  return <PathConfigPage pathName={decodedName} />
}
