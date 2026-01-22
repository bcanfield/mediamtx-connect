import { test, expect } from "@playwright/test";

test.describe("Streams Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the streams page with header", async ({ page }) => {
    await expect(page.locator("h2").filter({ hasText: "Streams" })).toBeVisible();
  });

  test("should show subheader text", async ({ page }) => {
    await expect(page.getByText("Live views of your active streams")).toBeVisible();
  });

  test("should have working navigation to config page", async ({ page }) => {
    await page.getByRole("link", { name: "Config" }).click({ force: true });
    await expect(page).toHaveURL(/\/config/);
  });

  test("should have working navigation to recordings page", async ({ page }) => {
    await page.getByRole("link", { name: "Recordings" }).click({ force: true });
    await expect(page).toHaveURL(/\/recordings/);
  });
});

test.describe("Streams Page - With MediaMTX Running", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should connect to MediaMTX successfully", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasConnectionError = bodyText?.includes("Cannot connect to MediaMTX") ?? false;
    expect(hasConnectionError).toBe(false);
  });

  test("should display stream cards when streams are active", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasStreams = !bodyText?.includes("No Active Streams");
    const hasConnectionError = bodyText?.includes("Cannot connect to MediaMTX") ?? false;

    if (!hasConnectionError) {
      expect(hasStreams).toBe(true);
    }
  });

  test("should show multiple stream cards for fake streams", async ({ page }) => {
    // Cards use aspect-square class from StreamCard component
    await expect(page.locator(".aspect-square").first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator(".aspect-square").count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display stream names", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasStreamNames =
      bodyText?.includes("stream1") ||
      bodyText?.includes("stream2") ||
      bodyText?.includes("stream3");

    const cardCount = await page.locator(".aspect-square").count();
    if (cardCount > 0) {
      expect(hasStreamNames).toBe(true);
    }
  });
});

test.describe("Streams Page - Remote URL Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should render streams page content", async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // The page should have the header and some content
    await expect(page.locator("h2").filter({ hasText: "Streams" })).toBeVisible();

    // There should be some visible content - either alerts, cards, or buttons
    // Just verify the page rendered something meaningful
    const buttons = await page.locator("button").count();
    expect(buttons).toBeGreaterThan(0);
  });
});
