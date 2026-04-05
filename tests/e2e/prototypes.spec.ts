import { expect, test } from "@playwright/test";

test.describe("Spaces guest prototype", () => {
  test("loads the identified attendee bootstrap flow into the overview, search, and collection paths", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/spaces_final.html?space=store&session=live&mode=identified");

    await expect(page).toHaveTitle("Spaces");
    await expect(page.locator("#bootLoading")).toHaveClass(/on/);
    await expect(page.getByRole("button", { name: "Enter Space" })).toBeVisible();

    await page.getByRole("button", { name: "Enter Space" }).click();
    await expect(page.locator("#bootName")).toHaveClass(/on/);

    await page.getByLabel("Name").fill("Aarav Shah");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#bootstrapShell")).toHaveClass(/done/);
    await expect(page.locator("#ov")).toHaveClass(/on/);
    await expect(page.locator("#overviewTitle")).toHaveText("Vega Dealer Day");
    await expect(page.locator("#overviewCollections .collection-card")).toHaveCount(3);

    await page.getByRole("button", { name: "Save featured item ↑" }).click();
    await expect(page.locator("#saveToast")).toContainText("Featured dealer pricing");

    await page.getByLabel("Search this space").fill("pricing");
    await expect(page.locator("#searchGroups")).toContainText("Volume pricing — up to 22% off");

    await page.locator(".search-group").filter({ hasText: "Live session" }).getByRole("button", { name: "Open" }).click();
    await expect(page.locator("#ls")).toHaveClass(/on/);
    await expect(page.getByText("Live · Vega Dealer Day")).toBeVisible();

    await page.getByRole("button", { name: "Space Overview" }).click();
    await expect(page.locator("#ov")).toHaveClass(/on/);

    await page.getByLabel("Search this space").fill("");
    await page.getByRole("button", { name: "Open products" }).click();
    await expect(page.locator("#ps")).toHaveClass(/on/);
    await expect(page.locator("#pcount")).toHaveText("1 / 6");

    await page.getByRole("button", { name: "Next →" }).click();
    await expect(page.locator("#pcount")).toHaveText("2 / 6");

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });

  test("shows live pin, expiry, offline queueing, and ended overlay states", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/spaces_final.html?space=store&session=ending&mode=identified&pin=1&offline=1");

    await expect(page.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await page.getByRole("button", { name: "Enter Space" }).click();
    await page.getByLabel("Name").fill("Aarav Shah");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.locator("#bootstrapShell")).toHaveClass(/done/);
    await expect(page.locator("#expiryBanner")).toHaveClass(/on/);
    await expect(page.locator("#offlineBanner")).toHaveClass(/on/);
    await expect(page.locator("#pinNotice")).toHaveClass(/on/);

    await page.locator("#pinDismissButton").click();
    await expect(page.locator("#pinNotice")).not.toHaveClass(/on/);

    await page.locator("#pinDemoButton").click();
    await expect(page.locator("#pinNotice")).toHaveClass(/on/);
    await page.locator("#pinOpenButton").click();
    await expect(page.locator("#ps")).toHaveClass(/on/);
    await expect(page.locator("#pcount")).toHaveText("3 / 6");

    await page.getByRole("button", { name: "Save Product Info ↑" }).click();
    await expect(page.locator("#saveToast")).toContainText("Queued");

    await page.locator("#endDemoButton").click();
    await expect(page.locator("#endedOverlay")).toHaveClass(/on/);
    await expect(page.getByText("This live room just closed.")).toBeVisible();

    const eventNames = await page.evaluate(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).spacesAnalytics.map((event: { name: string }) => event.name),
    );

    expect(eventNames).toEqual(
      expect.arrayContaining([
        "identity_submitted",
        "space_overview_viewed",
        "pin_received",
        "pin_dismissed",
        "offline_state_shown",
        "offline_save_queued",
        "session_end_viewed",
      ]),
    );

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });

  test("handles anonymous, empty, and ended attendee variants", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/spaces_final.html?space=restaurant&session=live&mode=anonymous");
    await expect(page.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await expect(page.getByText("Anonymous space")).toBeVisible();
    await page.getByRole("button", { name: "Enter Space" }).click();
    await expect(page.locator("#bootstrapShell")).toHaveClass(/done/);
    await expect(page.locator("#overviewTitle")).toHaveText("Amara Kitchen Dinner Service");
    await expect(page.locator("#overviewCollections .collection-card")).toHaveCount(1);
    await page.locator("#overviewCollections").getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#ms")).toHaveClass(/on/);
    await expect(page.locator(".menu-name")).toHaveText("Amara Kitchen");

    await page.goto("/spaces_final.html?space=empty&session=live&mode=anonymous");
    await page.getByRole("button", { name: "Enter Space" }).click();
    await expect(page.locator("#overviewEmpty")).toBeVisible();
    await expect(page.getByText("This space is live, but empty.")).toBeVisible();

    await page.goto("/spaces_final.html?space=store&session=ended&mode=identified");
    await expect(page.getByText("This session has ended.")).toBeVisible();
    await expect(page.getByText("Your saved items remain in your chosen app.")).toBeVisible();

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});

test.describe("Spaces host prototype", () => {
  test("loads and switches dashboard states", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/spaces_host.html");

    await expect(page).toHaveTitle("Spaces — Host App");
    await expect(page.locator(".nav button")).toHaveCount(4);
    await expect(page.locator("#dash")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Space Editor" }).click();
    await expect(page.locator("#editor")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.locator(".epv-btn.on")).toHaveText("Preview");

    await page.getByRole("button", { name: "Add Content", exact: true }).click();
    await expect(page.locator("#addcard")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Live Panel" }).click();
    await expect(page.locator("#live")).toHaveClass(/on/);

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});
