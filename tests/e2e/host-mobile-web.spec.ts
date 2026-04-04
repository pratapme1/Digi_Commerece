import { expect, test } from "@playwright/test";

test.describe("Digi host mobile web export", () => {
  test("completes the demo onboarding and first go-live flow", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

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
    await page.getByRole("button", { name: "Anonymous" }).click();
    await page.getByRole("button", { name: "Save and generate QR" }).click();

    await expect(page.getByText("Space QR")).toBeVisible();
    await expect(page.getByText("dealer-day-demo", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Copy attendee link" }).click();
    await expect(page.getByText("Attendee link copied.")).toBeVisible();
    await page.getByRole("button", { name: "Open dashboard" }).click();
    await expect(page.getByText("Vega Auto")).toBeVisible();
    await page.getByRole("button", { name: "Go Live" }).click();

    await expect(page.getByText("Go live", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "90 min" }).click();
    await page.getByRole("button", { name: "Confirm and go live" }).click();

    await expect(page.getByText("Live session active").last()).toBeVisible();
    await expect(page.getByText(/Ends at/).last()).toBeVisible();

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});
