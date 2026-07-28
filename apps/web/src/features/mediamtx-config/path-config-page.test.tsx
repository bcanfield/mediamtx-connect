import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { PathConfigPage } from './path-config-page'

// Materializing is one-way from the app's side unless the page can delete the
// entry again, so what this suite covers is the way back: the affordance shows
// up only for a path that has an entry of its own, and only the confirm deletes.
const deletePathConfig = vi.fn<(input: RpcInputs['config']['mediamtx']['deletePathConfig']) => void>()

// The effective config the page reads: `confName` is the entry the values come
// from — a wildcard until the path is materialized, its own name after.
let effective = { confName: 'all_others', conf: { record: true } }

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  pathConfig: () => effective,
  deletePathConfig,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

async function renderPage(confName: string) {
  effective = { confName, conf: { record: true } }
  const view = await renderWithProviders(<PathConfigPage name="stream1" />)
  await screen.findByRole('heading', { name: 'Path Config · stream1' })
  return view
}

describe('revert to inherited', () => {
  it('offers nothing to revert while the path tracks a wildcard entry', async () => {
    await renderPage('all_others')

    expect(await screen.findByText(/currently inherited from all_others/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revert to inherited' })).not.toBeInTheDocument()
  })

  it('offers the revert once the path has an entry of its own', async () => {
    await renderPage('stream1')

    expect(await screen.findByRole('button', { name: 'Revert to inherited' })).toBeInTheDocument()
  })

  it('deletes the entry only after the confirm', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Revert to inherited' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()

    await view.user.click(screen.getByRole('button', { name: 'Revert' }))

    expect(await screen.findByText('Reverted to inherited settings')).toBeInTheDocument()
    expect(deletePathConfig).toHaveBeenCalledWith(
      { name: 'stream1' } satisfies RpcInputs['config']['mediamtx']['deletePathConfig'],
    )
  })

  it('leaves the entry alone when the confirm is cancelled', async () => {
    const view = await renderPage('stream1')

    await view.user.click(await screen.findByRole('button', { name: 'Revert to inherited' }))
    await view.user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deletePathConfig).not.toHaveBeenCalled()
  })
})
