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
