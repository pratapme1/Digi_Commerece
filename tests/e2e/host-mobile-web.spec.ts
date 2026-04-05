import { expect, test } from "@playwright/test";

test.describe("Digi host mobile web export", () => {
  test("runs a live room with attendee sync and session summary", async ({ page }) => {
    test.setTimeout(45_000);
    const hostErrors: Error[] = [];
    page.on("pageerror", (error) => hostErrors.push(error));

    await page.goto("http://127.0.0.1:4184/");

    await expect(page).toHaveTitle("Digi Host");
    await expect(page.getByText("Create your host account")).toBeVisible();

    await page.getByRole("button", { name: "Continue with demo workspace" }).click();
    await expect(page.getByText("Name the business")).toBeVisible();

    await page.getByLabel("Business name").fill("Vega Auto");
    await page.getByRole("button", { name: "Store" }).click();
    await page.getByRole("button", { name: "Continue to brand setup" }).click();

    await expect(page.getByText("Shape the brand")).toBeVisible();
    await page.getByLabel("Brand label").fill("Vega Prime");
    await page.getByRole("button", { name: "#2563EB" }).click();
    await page.getByRole("button", { name: "Continue to space settings" }).click();

    await expect(page.getByText("Configure the first space")).toBeVisible();
    await page.getByLabel("Space name").fill("Dealer Day");
    await page.getByRole("button", { name: "Save and generate QR" }).click();

    await expect(page.getByText("Space QR")).toBeVisible();
    await expect(page.getByText("dealer-day-demo", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open dashboard" }).click();
    await expect(page.getByText("Vega Auto")).toBeVisible();
    await page.getByRole("button", { name: "Go Live" }).click();

    await expect(page.getByText("Go live", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "90 min" }).click();
    await page.getByRole("button", { name: "Confirm and go live" }).click();

    await expect(page.getByText("M3 Live Panel")).toBeVisible();
    await expect(page.getByText("Nothing pinned yet")).toBeVisible();

    const attendeePage = await page.context().newPage();
    const attendeeErrors: Error[] = [];
    attendeePage.on("pageerror", (error) => attendeeErrors.push(error));

    await attendeePage.goto("http://127.0.0.1:4184/attendee-demo.html?space=store&session=live&mode=identified&room=dealer-day-demo");
    await expect(attendeePage.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await attendeePage.getByRole("button", { name: "Enter Space" }).click();
    await attendeePage.getByLabel("Name").fill("Aarav Shah");
    await attendeePage.getByRole("button", { name: "Continue" }).click();

    await expect(attendeePage.locator("#bootstrapShell")).toHaveClass(/done/);
    await expect(attendeePage.locator("#overviewTitle")).toHaveText("Vega Dealer Day");

    await page.getByRole("button", { name: "Refresh live panel" }).click();
    await expect(page.locator("body")).toContainText("Aarav Shah", { timeout: 8000 });

    await page.getByRole("button", { name: "Pin" }).first().click();

    await expect(page.getByRole("button", { name: "Pinned" })).toBeVisible();
    await expect(attendeePage.locator("#pinNotice")).toHaveClass(/on/, { timeout: 5000 });
    await expect(attendeePage.locator("#pinTitle")).toHaveText("65W GaN charger dealer pricing");

    await attendeePage.getByRole("button", { name: "Open pinned item" }).click();
    await expect(attendeePage.locator("#ps")).toHaveClass(/on/);
    await attendeePage.getByRole("button", { name: "Save Product Info ↑" }).click();

    await page.getByRole("button", { name: "End live session" }).click();
    await expect(page.getByText("Session summary", { exact: true })).toBeVisible();
    await expect(page.getByText("1 attendees", { exact: true })).toBeVisible();
    await expect(page.locator("body")).toContainText("65W GaN charger dealer pricing");

    await expect(attendeePage.locator("#endedOverlay")).toHaveClass(/on/, { timeout: 5000 });
    await expect(attendeePage.getByText("This live room just closed.")).toBeVisible();

    expect(hostErrors, `Unexpected host page errors: ${hostErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
    expect(attendeeErrors, `Unexpected attendee page errors: ${attendeeErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});
