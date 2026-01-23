import type { PathConf } from '@/lib/MediaMTX/generated'

import { AlertTriangle, Edit, Plus } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

import { getPathsList } from '../actions/getPathsList'
import { DeletePathButton } from './DeletePathButton'

export const dynamic = 'force-dynamic'

export async function PathsListPage() {
  const pathsList = await getPathsList()

  if (!pathsList) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Unable to connect to MediaMTX. Please check your configuration.
        </AlertDescription>
      </Alert>
    )
  }

  const paths = pathsList.items || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Stream Paths</h2>
          <p className="text-sm text-muted-foreground">
            Manage your MediaMTX stream path configurations
          </p>
        </div>
        <Link href="/config/paths/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Path
          </Button>
        </Link>
      </div>

      {paths.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Paths Configured</AlertTitle>
          <AlertDescription>
            No stream paths are configured yet. Create a new path to get started.
          </AlertDescription>
        </Alert>
      )}

      {paths.length > 0 && (
        <div className="grid gap-4">
          {paths.map((path: PathConf) => (
            <Card key={path.name}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {path.name}
                    </CardTitle>
                    <CardDescription>
                      {path.source || 'No source configured'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/config/paths/${encodeURIComponent(path.name || '')}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <DeletePathButton pathName={path.name || ''} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${path.record ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>
                      Recording:
                      {path.record ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${path.publishUser ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>
                      Publish Auth:
                      {path.publishUser ? 'Configured' : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${path.readUser ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>
                      Read Auth:
                      {path.readUser ? 'Configured' : 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
