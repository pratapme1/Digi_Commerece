import { expect, test } from "@playwright/test";

test.describe("Digi attendee web app", () => {
  test("supports entry, search, and pinned flows on the real route", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(
      "http://127.0.0.1:4100/s/demo-room?demo=1&spaceType=store&mode=identified&session=live&spaceName=Vega%20Dealer%20Day&brandName=Vega%20Prime&pinnedId=dealer-charger&pinnedTitle=65W%20GaN%20charger%20dealer%20pricing&pinnedSubtitle=Live%20offer&pinnedCollectionId=products&pinnedScreen=ps&pinnedCardId=VE-CH03&pinnedProductIndex=2",
    );

    await expect(page.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await page.getByRole("button", { name: "Enter Space" }).click();
    await page.getByLabel("Name").fill("Aarav Shah");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Host pin received")).toBeVisible();
    await page.getByRole("button", { name: "Open pinned item" }).first().click();
    await expect(page.getByRole("heading", { name: "65W GaN Dual USB-C Charger" })).toBeVisible();

    await page.getByRole("button", { name: "Back to space" }).click();
    await page.getByLabel("Search this space").fill("wireless");
    await expect(page.getByText("Wireless Charging Pad 15W")).toBeVisible();
    await page.getByRole("button", { name: /Wireless Charging Pad 15W/i }).click();
    await expect(page.getByRole("heading", { name: "Wireless Charging Pad 15W" })).toBeVisible();

    expect(pageErrors, `Unexpected attendee page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });

  test("shows inactive and ended status states", async ({ page }) => {
    await page.goto("http://127.0.0.1:4100/s/demo-room?demo=1&spaceType=restaurant&mode=anonymous&session=inactive&spaceName=Amara%20Kitchen");
    await expect(page.getByText("This space is not live right now.")).toBeVisible();

    await page.goto("http://127.0.0.1:4100/s/demo-room?demo=1&spaceType=business_card&mode=anonymous&session=ended&spaceName=Ananya%20Reddy");
    await expect(page.getByText("This live room just closed.")).toBeVisible();
  });
});
