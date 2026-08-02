import { ORPCError } from '@orpc/server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { AddRtspPathPage } from './add-rtsp-path-page'

const addPath = vi.fn()
// What MediaMTX says when it turns the create down. Thrown by the stub rather
// than staged as the mock's return value: a rejected promise held by a mock
// vitest later resets reads to vitest as an unhandled rejection.
let rejection: Error | null = null

const server = createRpcServer({
  streamsList: () => ({ status: 'connected', streams: [] }),
  addPath: (input) => {
    addPath(input)
    if (rejection)
      throw rejection
  },
})

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => {
  addPath.mockClear()
  rejection = null
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

type User = Awaited<ReturnType<typeof renderWithProviders>>['user']

/** Fills the wizard for a camera that needs credentials to be reachable. */
async function fillCamera(user: User) {
  await user.type(screen.getByLabelText('Path name'), 'front-door')
  await user.type(screen.getByLabelText('Host'), 'cam.lan')
  await user.type(screen.getByLabelText('Stream path'), 'live/0')
  await user.type(screen.getByLabelText('Username'), 'admin')
  await user.type(screen.getByLabelText('Password'), 'p@ssw0rd')
}

describe('guided rtsp add', () => {
  it('composes the source from its parts and creates the path', async () => {
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)
    await user.click(screen.getByRole('button', { name: 'Add path' }))

    await vi.waitFor(() => expect(addPath).toHaveBeenCalled())
    // The password is percent-encoded: left raw, its `@` ends the authority at
    // the wrong place and MediaMTX pulls from a host that isn't the camera.
    expect(addPath.mock.calls[0]?.[0]).toMatchObject({
      name: 'front-door',
      source: 'rtsp://admin:p%40ssw0rd@cam.lan:554/live/0',
    })
  })

  // `automatic` is what an entry without the key already does, so sending it
  // would pin a value the path would otherwise keep inheriting.
  it('sends a chosen transport and leaves an automatic one off', async () => {
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)
    await user.click(screen.getByRole('button', { name: 'Add path' }))
    await vi.waitFor(() => expect(addPath).toHaveBeenCalled())
    expect(addPath.mock.calls[0]?.[0].rtspTransport).toBeUndefined()

    addPath.mockClear()
    await user.click(screen.getByRole('radio', { name: 'tcp' }))
    await user.click(screen.getByRole('button', { name: 'Add path' }))

    await vi.waitFor(() => expect(addPath).toHaveBeenCalled())
    expect(addPath.mock.calls[0]?.[0].rtspTransport).toBe('tcp')
  })

  it('lands on the new path playing', async () => {
    const { user, router } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)
    await user.click(screen.getByRole('button', { name: 'Add path' }))

    await vi.waitFor(() =>
      expect(router.state.location.search).toEqual({ play: 'front-door' }))
  })

  it('previews the URL it will write with the password masked', async () => {
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)

    const preview = screen.getByTestId('source-preview')
    expect(preview).toHaveTextContent('rtsp://admin:••••••••@cam.lan:554/live/0')
    expect(preview).not.toHaveTextContent('p@ssw0rd')
  })

  // The field it was typed into is the only place the password may live, and
  // even there it is not readable.
  it('never renders the password as readable text', async () => {
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.queryByText(/p@ssw0rd/)).not.toBeInTheDocument()
  })

  it('surfaces the reason MediaMTX gave for turning a create down', async () => {
    rejection = new ORPCError('BAD_REQUEST', { message: 'path already exists' })
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await fillCamera(user)
    await user.click(screen.getByRole('button', { name: 'Add path' }))

    expect(await screen.findByText('path already exists')).toBeInTheDocument()
  })

  it('will not submit without a path name', async () => {
    const { user } = await renderWithProviders(<AddRtspPathPage />)
    await user.type(screen.getByLabelText('Host'), 'cam.lan')
    await user.click(screen.getByRole('button', { name: 'Add path' }))

    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(addPath).not.toHaveBeenCalled()
  })
})
