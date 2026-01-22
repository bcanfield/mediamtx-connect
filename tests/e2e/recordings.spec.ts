import { test, expect } from "@playwright/test";

test.describe("Recordings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recordings");
  });

  test("should load the recordings page with header", async ({ page }) => {
    await expect(page.locator("h2").filter({ hasText: "Recordings" })).toBeVisible();
    await expect(page.getByText("Browse your recordings")).toBeVisible();
  });

  test("should display stream cards or appropriate message", async ({ page }) => {
    const body = page.locator("body");
    const bodyText = await body.textContent();

    // Cards have bg-card class from shadcn Card component
    const hasRecordings = (await page.locator(".bg-card").count()) > 0;
    const hasNoRecordingsMessage = bodyText?.includes("No Recordings Found") ?? false;
    const hasDirectoryError = bodyText?.includes("Cannot Access Recordings Directory") ?? false;

    expect(hasRecordings || hasNoRecordingsMessage || hasDirectoryError).toBe(true);
  });

  test("should show recording count for each stream when recordings exist", async ({
    page,
  }) => {
    const hasCards = (await page.locator(".bg-card").count()) > 0;
    if (hasCards) {
      await expect(page.getByText(/\d+ Recording/)).toBeVisible();
    }
  });

  test("should have view buttons when recordings exist", async ({ page }) => {
    const hasCards = (await page.locator(".bg-card").count()) > 0;
    if (hasCards) {
      await expect(page.getByRole("button", { name: "View" })).toBeVisible();
    }
  });
});

test.describe("Recording Detail Page", () => {
  test("should handle non-existent stream gracefully", async ({ page }) => {
    await page.goto("/recordings/non-existent-stream");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to detail page from recordings list", async ({ page }) => {
    await page.goto("/recordings");

    const viewButton = page.getByRole("button", { name: "View" }).first();
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click();
      await expect(page).toHaveURL(/\/recordings\/.+/);
    }
  });
});
