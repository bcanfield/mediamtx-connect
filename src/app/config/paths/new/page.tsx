import { PathConfigForm } from '@/features/streams/paths'

export const dynamic = 'force-dynamic'

export default function NewPathPage() {
  return <PathConfigForm isNew={true} />
}
