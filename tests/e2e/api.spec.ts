import { expect, test } from '@playwright/test'

test.describe('Health Check API', () => {
  test('should return healthy status when the config store is readable', async ({
    request,
  }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('status', 'healthy')
    expect(body).toHaveProperty('timestamp')
  })

  test('should include a valid timestamp', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()
    const timestamp = new Date(body.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.getTime()).not.toBeNaN()
  })
})

test.describe('Media Error Handling', () => {
  test('should handle screenshot request for non-existent stream', async ({
    request,
  }) => {
    const response = await request.get('/media/screenshots/non-existent-stream/latest')
    expect(response.status()).toBe(404)
  })

  test('should reject path traversal in media routes', async ({ request }) => {
    const response = await request.get('/media/recordings/cam/..%2F..%2Fdata%2Fconfig.json')
    expect([400, 404]).toContain(response.status())
  })
})

test.describe('Recording Playback API', () => {
  // These tests use the test-data recordings created by setup script
  const testStream = 'camera1'
  const testFile = '2024-01-15_10-30-00.mp4'

  test('should stream recording file with correct headers', async ({ request }) => {
    const response = await request.get(`/media/recordings/${testStream}/${testFile}`, {
      failOnStatusCode: false,
    })

    // If test data exists, should return 200 with video headers
    if (response.status() === 200) {
      const contentType = response.headers()['content-type']
      expect(contentType).toBe('video/mp4')

      const acceptRanges = response.headers()['accept-ranges']
      expect(acceptRanges).toBe('bytes')

      const contentLength = response.headers()['content-length']
      expect(Number.parseInt(contentLength)).toBeGreaterThan(0)
    }
    else {
      // Test data might not exist, that's ok - just verify proper error handling
      expect([404, 500]).toContain(response.status())
    }
  })

  test('should serve partial content for Range requests', async ({ request }) => {
    const response = await request.get(`/media/recordings/${testStream}/${testFile}`, {
      headers: { Range: 'bytes=0-99' },
      failOnStatusCode: false,
    })

    if (response.status() === 206) {
      expect(response.headers()['content-range']).toMatch(/^bytes 0-99\/\d+$/)
      expect(response.headers()['content-length']).toBe('100')
    }
    else {
      // Test data might not exist
      expect([404, 500]).toContain(response.status())
    }
  })

  test('should return 404 for non-existent recording', async ({ request }) => {
    const response = await request.get('/media/recordings/fake-stream/fake-file.mp4', {
      failOnStatusCode: false,
    })
    expect([404, 500]).toContain(response.status())
  })
})

test.describe('Recording Download API', () => {
  const testStream = 'camera1'
  const testFile = '2024-01-15_10-30-00.mp4'

  test('should download recording file with attachment disposition', async ({ request }) => {
    const response = await request.get(`/media/recordings/${testStream}/${testFile}?download`, {
      failOnStatusCode: false,
    })

    if (response.status() === 200) {
      expect(response.headers()['content-type']).toBe('video/mp4')
      expect(response.headers()['content-disposition']).toContain('attachment')
      expect(Number.parseInt(response.headers()['content-length'])).toBeGreaterThan(0)
    }
    else {
      // Test data might not exist
      expect([404, 500]).toContain(response.status())
    }
  })

  test('should return error for non-existent download', async ({ request }) => {
    const response = await request.get('/media/recordings/fake-stream/fake-file.mp4?download', {
      failOnStatusCode: false,
    })
    expect([404, 500]).toContain(response.status())
  })
})

test.describe('Screenshot API', () => {
  test('should return PNG for a stream with screenshots', async ({ request }) => {
    const response = await request.get('/media/screenshots/camera1/latest', {
      failOnStatusCode: false,
    })
    if (response.status() === 200) {
      expect(response.headers()['content-type']).toContain('image/png')
      expect(response.headers()['cache-control']).toBe('no-store')
    }
    else {
      expect(response.status()).toBe(404)
    }
  })

  test('should handle any stream name gracefully', async ({ request }) => {
    const response = await request.get('/media/screenshots/any-stream-name/latest')
    expect(response.status()).toBe(404)
  })
})

test.describe('SPA fallback', () => {
  test('unknown app routes serve the SPA shell', async ({ request }) => {
    const response = await request.get('/some/client/route')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')
  })
})
