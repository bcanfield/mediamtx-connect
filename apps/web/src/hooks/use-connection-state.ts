import { useQuery } from '@tanstack/react-query'

import { orpc } from '@/orpc'

export const CONNECTION_POLL_MS = 15000

export function useConnectionState() {
  const query = useQuery({
    ...orpc.streams.list.queryOptions(),
    refetchInterval: CONNECTION_POLL_MS,
  })
  const state = query.data
  return {
    connected: state?.status === 'connected',
    unknown: state === undefined,
    liveCount: state?.status === 'connected' ? state.streams.length : 0,
  }
}
