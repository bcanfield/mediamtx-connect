import { test, expect } from "@playwright/test";

test.describe("Config Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/config");
  });

  test("should load the config page", async ({ page }) => {
    await expect(page).toHaveURL(/\/config/);
  });

  test("should display configuration form fields", async ({ page }) => {
    await expect(page.getByText("MediaMtx Url", { exact: true })).toBeVisible();
    await expect(page.getByText("MediaMtx Api Port", { exact: true })).toBeVisible();
  });

  test("should have input fields in the form", async ({ page }) => {
    const form = page.locator("form");
    await expect(form).toBeVisible();
    const inputs = form.locator("input");
    // Form has 5 fields: mediaMtxUrl, mediaMtxApiPort, remoteMediaMtxUrl, recordingsDirectory, screenshotsDirectory
    await expect(inputs).toHaveCount(5);
  });

  test("should have a save/update button", async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should allow editing form fields", async ({ page }) => {
    const firstInput = page.locator("form input").first();
    await expect(firstInput).toBeEnabled();
  });

  test("should display form descriptions", async ({ page }) => {
    await expect(
      page.getByText("The address to your MediaMTX Instance")
    ).toBeVisible();
  });
});

test.describe("Config Navigation", () => {
  test("should have navigation when on config pages", async ({ page }) => {
    await page.goto("/config");
    await expect(page.getByRole("link", { name: "Recordings" })).toBeVisible();
  });

  test("should navigate back to home from config", async ({ page, baseURL }) => {
    await page.goto("/config");
    await page.getByRole("link", { name: "Connect" }).click({ force: true });
    await expect(page).toHaveURL(baseURL + "/");
  });
});
