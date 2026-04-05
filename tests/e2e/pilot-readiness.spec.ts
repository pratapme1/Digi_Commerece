import { expect, test, type Page } from "@playwright/test";

async function bootstrapDemoWorkspace(page: Page) {
  await page.goto("http://127.0.0.1:4184/");
  await expect(page.getByText("Create your host account")).toBeVisible();

  await page.getByRole("button", { name: "Continue with demo workspace" }).click();
  await page.getByLabel("Business name").fill("Pilot Ops");
  await page.getByRole("button", { name: "Store" }).click();
  await page.getByRole("button", { name: "Continue to brand setup" }).click();
  await page.getByLabel("Brand label").fill("Pilot Prime");
  await page.getByRole("button", { name: "#2563EB" }).click();
  await page.getByRole("button", { name: "Continue to space settings" }).click();
  await page.getByLabel("Space name").fill("Pilot Room");
  await page.getByRole("button", { name: "Save and generate QR" }).click();
  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.getByText("Pilot Ops")).toBeVisible();
}

test.describe("Pilot readiness", () => {
  test("stays within local pilot budgets for host and attendee entry", async ({ page }) => {
    test.setTimeout(45_000);

    const hostStart = Date.now();
    await page.goto("http://127.0.0.1:4184/");
    await expect(page.getByText("Create your host account")).toBeVisible();
    const hostShellMs = Date.now() - hostStart;

    await bootstrapDemoWorkspace(page);
    const operationsStart = Date.now();
    await page.getByRole("button", { name: "Open operations" }).click();
    await expect(page.getByText("Operations", { exact: true })).toBeVisible();
    const operationsTransitionMs = Date.now() - operationsStart;

    const attendeeStart = Date.now();
    await page.goto("http://127.0.0.1:4100/s/dealer-day-demo?demo=1&room=dealer-day-demo&spaceType=store&mode=identified&spaceName=Pilot%20Room&brandName=Pilot%20Prime");
    await expect(page.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await page.getByRole("button", { name: "Enter Space" }).click();
    await page.getByLabel("Name").fill("Aarav Shah");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Pilot Room" })).toBeVisible();
    await expect(page.getByLabel("Search this space")).toBeVisible();
    const attendeeEntryMs = Date.now() - attendeeStart;

    expect(hostShellMs).toBeLessThan(3_000);
    expect(operationsTransitionMs).toBeLessThan(2_000);
    expect(attendeeEntryMs).toBeLessThan(8_000);
  });

  test("keeps destructive admin actions disabled until a second space exists", async ({ page }) => {
    await bootstrapDemoWorkspace(page);
    await page.getByRole("button", { name: "Open operations" }).click();

    await expect(page.getByText("Operations", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Delete" }).first()).toBeDisabled();
    await expect(page.getByText("dealer-pricing.csv · Validated")).toBeVisible();
  });
});
