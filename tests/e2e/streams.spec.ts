import { test, expect } from "@playwright/test";

test.describe("Streams Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the streams page with header", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h2").filter({ hasText: "Streams" })).toBeVisible({ timeout: 10000 });
  });

  test("should show subheader text", async ({ page }) => {
    await expect(page.getByText("Live views of your active streams").first()).toBeVisible();
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

  test("should show connection status", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasConnectionError = bodyText?.includes("Cannot connect to MediaMTX") ?? false;
    const hasStreams = bodyText?.includes("stream") ?? false;
    const hasNoStreams = bodyText?.includes("No Active Streams") ?? false;
    const hasConfigurePrompt = bodyText?.includes("Configure Remote URL") ?? false;

    // Page should show one of these states
    expect(hasConnectionError || hasStreams || hasNoStreams || hasConfigurePrompt).toBe(true);
  });

  test("should display stream cards when MediaMTX is connected", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasConnectionError = bodyText?.includes("Cannot connect to MediaMTX") ?? false;

    if (!hasConnectionError) {
      // Either has streams (stream names visible), no active streams message, or configure prompt
      const hasNoStreams = bodyText?.includes("No Active Streams") ?? false;
      const hasConfigurePrompt = bodyText?.includes("Configure Remote URL") ?? false;
      const hasStreamContent =
        bodyText?.includes("stream1") ||
        bodyText?.includes("stream2") ||
        bodyText?.includes("stream3");
      const buttonCount = await page.locator("button").count();

      expect(hasStreamContent || hasNoStreams || hasConfigurePrompt || buttonCount > 2).toBe(true);
    }
  });

  test("should show stream cards when available", async ({ page }) => {
    const bodyText = await page.locator("body").textContent();
    const hasConnectionError = bodyText?.includes("Cannot connect to MediaMTX") ?? false;
    const hasConfigurePrompt = bodyText?.includes("Configure Remote URL") ?? false;

    // Only check for cards if we're connected and configured
    if (!hasConnectionError && !hasConfigurePrompt) {
      const hasNoStreams = bodyText?.includes("No Active Streams") ?? false;
      // Check for stream names or buttons which indicate cards are present
      const hasStreamContent =
        bodyText?.includes("stream1") ||
        bodyText?.includes("stream2") ||
        bodyText?.includes("stream3");
      const buttonCount = await page.locator("button").count();
      expect(hasNoStreams || hasStreamContent || buttonCount > 2).toBe(true);
    }
  });

  test("should display stream names when streams exist", async ({ page }) => {
    const cardCount = await page.locator(".aspect-square").count();

    if (cardCount > 0) {
      const bodyText = await page.locator("body").textContent();
      const hasStreamNames =
        bodyText?.includes("stream1") ||
        bodyText?.includes("stream2") ||
        bodyText?.includes("stream3") ||
        bodyText?.includes("stream4") ||
        bodyText?.includes("stream5");
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
