'use server'

import { createS3BackupService } from '../service/s3-backup-service'

interface TestConnectionParams {
  remoteType: 's3'
  remoteBucket: string
  remoteRegion: string
  remoteAccessKey: string
  remoteSecretKey: string
}

interface TestConnectionResult {
  success: boolean
  errorMessage?: string
}

export async function testRemoteConnection(params: TestConnectionParams): Promise<TestConnectionResult> {
  const { remoteBucket, remoteRegion, remoteAccessKey, remoteSecretKey } = params

  // Validate required fields
  if (!remoteBucket || !remoteRegion || !remoteAccessKey || !remoteSecretKey) {
    return {
      success: false,
      errorMessage: 'All fields (bucket, region, access key, secret key) are required.',
    }
  }

  const s3Service = createS3BackupService({
    bucket: remoteBucket,
    region: remoteRegion,
    accessKey: remoteAccessKey,
    secretKey: remoteSecretKey,
  })

  return await s3Service.testConnection()
}
