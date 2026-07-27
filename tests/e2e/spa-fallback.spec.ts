import { expect, test } from '@playwright/test'

// The rest of api.spec.ts moved to apps/api/src/{media.serving,health}.test.ts,
// where the fixture state is known and the assertions can be unconditional.
// This one stays: it asserts that the *built* server serves index.html for
// unknown paths, which needs a real build and a real static root.
test('unknown client routes serve the SPA shell', async ({ request }) => {
  const response = await request.get('/some/client/route')

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/html')
})
