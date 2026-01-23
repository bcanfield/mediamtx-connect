import { NextResponse } from 'next/server'
import { getBackupHistory } from '@/features/backup/actions/getBackupHistory'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)

    const history = await getBackupHistory(limit)

    return NextResponse.json(
      {
        status: 'success',
        data: history,
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
