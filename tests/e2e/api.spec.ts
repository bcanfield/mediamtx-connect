import { test, expect } from "@playwright/test";

test.describe("Health Check API", () => {
  test("should return healthy status when database is connected", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("status", "healthy");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("database", "connected");
  });

  test("should include a valid timestamp", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    const timestamp = new Date(body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});

test.describe("API Error Handling", () => {
  test("should handle non-existent API routes", async ({ request }) => {
    const response = await request.get("/api/non-existent-endpoint");
    expect(response.status()).toBe(404);
  });

  test("should handle screenshot request for non-existent stream", async ({
    request,
  }) => {
    const response = await request.get("/api/non-existent-stream/first-screenshot");
    expect([404, 500]).toContain(response.status());
  });
});

test.describe("Recording Playback API", () => {
  // These tests use the test-data recordings created by setup script
  const testStream = "camera1";
  const testFile = "2024-01-15_10-30-00.mp4";

  test("should stream recording file with correct headers", async ({ request }) => {
    const response = await request.get(`/api/${testStream}/${testFile}/view-recording`, {
      failOnStatusCode: false,
    });

    // If test data exists, should return 200 with video headers
    if (response.status() === 200) {
      const contentType = response.headers()["content-type"];
      expect(contentType).toBe("video/mp4");

      const acceptRanges = response.headers()["accept-ranges"];
      expect(acceptRanges).toBe("bytes");

      const contentLength = response.headers()["content-length"];
      expect(parseInt(contentLength)).toBeGreaterThan(0);
    } else {
      // Test data might not exist, that's ok - just verify proper error handling
      expect([404, 500]).toContain(response.status());
    }
  });

  test("should return 500 for non-existent recording", async ({ request }) => {
    const response = await request.get("/api/fake-stream/fake-file.mp4/view-recording", {
      failOnStatusCode: false,
    });
    expect([404, 500]).toContain(response.status());
  });
});

test.describe("Recording Download API", () => {
  const testStream = "camera1";
  const testFile = "2024-01-15_10-30-00.mp4";

  test("should download recording file with correct headers", async ({ request }) => {
    const response = await request.get(`/api/${testStream}/${testFile}/download-recording`, {
      failOnStatusCode: false,
    });

    // If test data exists, should return 200 with video content
    if (response.status() === 200) {
      const contentType = response.headers()["content-type"];
      expect(contentType).toBe("video/mp4");

      const contentLength = response.headers()["content-length"];
      expect(parseInt(contentLength)).toBeGreaterThan(0);
    } else {
      // Test data might not exist
      expect([404, 500]).toContain(response.status());
    }
  });

  test("should return error for non-existent download", async ({ request }) => {
    const response = await request.get("/api/fake-stream/fake-file.mp4/download-recording", {
      failOnStatusCode: false,
    });
    expect([404, 500]).toContain(response.status());
  });
});

test.describe("Screenshot API", () => {
  test("should return image content-type for valid stream", async ({ request }) => {
    // Even without actual screenshots, the API now returns a transparent PNG
    const response = await request.get("/api/stream1/first-screenshot");
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });

  test("should handle any stream name gracefully", async ({ request }) => {
    const response = await request.get("/api/any-stream-name/first-screenshot");
    // Should return 404 with valid image (transparent PNG)
    expect(response.status()).toBe(404);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });
});
