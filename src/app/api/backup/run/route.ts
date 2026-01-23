import { NextResponse } from 'next/server'
import { runBackup } from '@/features/backup/actions/runBackup'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const type = body.type || 'full'

    if (!['database', 'config', 'full'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid backup type. Must be "database", "config", or "full"' },
        { status: 400 },
      )
    }

    const result = await runBackup(type as 'database' | 'config' | 'full')

    if (result.success) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Backup completed successfully',
          ...result,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        status: 'failed',
        message: 'Backup failed',
        ...result,
      },
      { status: 500 },
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
