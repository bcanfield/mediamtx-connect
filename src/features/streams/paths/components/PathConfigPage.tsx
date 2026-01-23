import type { PathConfigFormData } from '../schemas/path-config.schema'

import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { getPathConfig } from '../actions/getPathConfig'
import { PathConfigForm } from './PathConfigForm'

interface PathConfigPageProps {
  pathName: string
}

export async function PathConfigPage({ pathName }: PathConfigPageProps) {
  const pathConf = await getPathConfig(pathName)

  if (!pathConf) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Path Not Found</AlertTitle>
        <AlertDescription>
          Unable to load path configuration for "
          {pathName}
          ". The path may not exist or there was an error connecting to MediaMTX.
        </AlertDescription>
      </Alert>
    )
  }

  // Convert PathConf to PathConfigFormData (ensure name is set)
  const formData: PathConfigFormData = {
    ...pathConf,
    name: pathName,
  }

  return <PathConfigForm pathConf={formData} />
}
