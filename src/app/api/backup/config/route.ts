import { NextResponse } from 'next/server'
import { getBackupConfig } from '@/features/backup/actions/getBackupConfig'
import { updateBackupConfig } from '@/features/backup/actions/updateBackupConfig'

export async function GET() {
  try {
    const config = await getBackupConfig()

    return NextResponse.json(
      {
        status: 'success',
        data: config,
      },
      { status: 200 },
    )
  }
  catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const config = await updateBackupConfig({ backupConfig: body })

    if (!config) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid backup configuration',
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        status: 'success',
        data: config,
      },
      { status: 200 },
    )
  }
  catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
