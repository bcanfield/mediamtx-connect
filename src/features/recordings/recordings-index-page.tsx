import { AlertTriangle, Settings } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { summarizeStreamRecordings } from '@/features/recordings/file-operations'

import { RecordingsIndexEmpty } from './recordings-index-empty'
import { RecordingsIndexView } from './recordings-index-view'

export const dynamic = 'force-dynamic'

const crumbs = [{ label: 'Recordings' }]

export async function RecordingsIndexPage() {
  const config = await getAppConfig()
  if (!config) {
    return (
      <>
        <PageHeader crumbs={crumbs} />
        <PageLayout
          header="Recordings"
          subHeader="Browse your recordings across your various streams"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              Unable to load configuration. Please check your database connection.
            </AlertDescription>
          </Alert>
        </PageLayout>
      </>
    )
  }

  let error = false
  let summary: ReturnType<typeof summarizeStreamRecordings> = {}

  try {
    summary = summarizeStreamRecordings(config.recordingsDirectory)
  }
  catch {
    error = true
  }

  const streams = Object.entries(summary).map(([name, value]) => ({
    name,
    count: value.count,
    latestMtime: value.latestMtime ? value.latestMtime.toISOString() : null,
  }))

  const hasRecordings = streams.length > 0

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout
        header="Recordings"
        subHeader="Browse your recordings across your various streams"
      >
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cannot Access Recordings Directory</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Unable to read the recordings directory at
                {' '}
                <code className="bg-muted px-1 rounded">
                  {config.recordingsDirectory}
                </code>
              </p>
              <p className="text-sm">
                Make sure the directory exists and has the correct permissions.
              </p>
              <Link href="/config" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Check Config
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {!error && !hasRecordings && <RecordingsIndexEmpty />}

        {!error && hasRecordings && <RecordingsIndexView streams={streams} />}
      </PageLayout>
    </>
  )
}
