import { AlertTriangle, Radio, Settings, Users, Wifi } from 'lucide-react'
import Link from 'next/link'
import { RefreshButton } from '@/shared/components/feedback'
import { PageLayout } from '@/shared/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { getDashboardData } from '../actions/getDashboardData'

import { formatBytes } from '../types'
import { ClientsTable } from './ClientsTable'

import { ConnectionHealth } from './ConnectionHealth'
import { ProtocolDistribution } from './ProtocolDistribution'
import { StatsCard } from './StatsCard'
import { StreamsTable } from './StreamsTable'

export const dynamic = 'force-dynamic'

export async function DashboardPage() {
  const data = await getDashboardData()

  const isConnected = !data.error

  return (
    <PageLayout
      header="Connection Dashboard"
      subHeader="Real-time overview of streams, connections, and bandwidth"
    >
      {data.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{data.error}</p>
            <div className="flex gap-2 mt-3">
              <Link href="/config">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Check Config
                </Button>
              </Link>
              <RefreshButton />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Streams"
          value={data.connectionStats.totalStreams}
          description={`${data.connectionStats.activeStreams} active`}
          icon={Radio}
          trend={data.connectionStats.activeStreams > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Connected Clients"
          value={data.connectionStats.totalClients}
          description={Object.entries(data.protocolStats)
            .filter(([, count]) => count > 0)
            .map(([protocol]) => protocol.toUpperCase())
            .join(', ') || 'No connections'}
          icon={Users}
          trend={data.connectionStats.totalClients > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Bandwidth In"
          value={formatBytes(data.connectionStats.totalBytesReceived)}
          description="Total received"
          icon={Wifi}
        />
        <StatsCard
          title="Bandwidth Out"
          value={formatBytes(data.connectionStats.totalBytesSent)}
          description="Total sent"
          icon={Wifi}
        />
      </div>

      {/* Health and Protocol Distribution */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <ConnectionHealth
          stats={data.connectionStats}
          isConnected={isConnected}
          error={data.error}
        />
        <ProtocolDistribution stats={data.protocolStats} />
      </div>

      {/* Streams Table */}
      <div className="mb-6">
        <StreamsTable streams={data.streams} />
      </div>

      {/* Clients Table */}
      <div className="mb-6">
        <ClientsTable clients={data.clients} />
      </div>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-right">
        Last updated:
        {' '}
        {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </PageLayout>
  )
}
