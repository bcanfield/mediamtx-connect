import type { contract } from '@connect/contract'
import type { ContractRouterClient } from '@orpc/contract'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
  url: `${window.location.origin}/rpc`,
})

export const client: ContractRouterClient<typeof contract>
  = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
