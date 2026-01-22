import { test, expect } from "@playwright/test";

test.describe("MediaMTX API Connectivity", () => {
  test("should connect to MediaMTX API", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("itemCount");
    expect(body).toHaveProperty("items");
  });

  test("should return streams list", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("should have fake streams running", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.itemCount).toBeGreaterThanOrEqual(1);
  });

  test("should have 5 fake streams", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.itemCount).toBe(5);
  });

  test("should have correct stream names", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    const streamNames = body.items.map((item: { name: string }) => item.name);
    expect(streamNames).toContain("stream1");
    expect(streamNames).toContain("stream2");
    expect(streamNames).toContain("stream3");
    expect(streamNames).toContain("stream4");
    expect(streamNames).toContain("stream5");
  });

  test("should have streams marked as ready", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/paths/list");
    expect(response.status()).toBe(200);
    const body = await response.json();
    for (const item of body.items) {
      expect(item.ready).toBe(true);
    }
  });

  test("should return global config", async ({ request }) => {
    const response = await request.get("http://localhost:9997/v3/config/global/get");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("hlsAddress");
    expect(body).toHaveProperty("api");
    expect(body.api).toBe(true);
  });
});

test.describe("MediaMTX HLS Endpoints", () => {
  test("should serve HLS endpoint", async ({ request }) => {
    const response = await request.get("http://localhost:8888", {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(response.status());
  });
});
