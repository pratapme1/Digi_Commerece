import { expect, test, type Page } from "@playwright/test";

async function bootstrapDemoWorkspace(page: Page, businessName = "Vega Auto") {
  await page.goto("http://127.0.0.1:4184/");

  await expect(page).toHaveTitle("Digi Host");
  await expect(page.getByText("Create your host account")).toBeVisible();

  await page.getByRole("button", { name: "Continue with demo workspace" }).click();
  await expect(page.getByText("Name the business")).toBeVisible();

  await page.getByLabel("Business name").fill(businessName);
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
  await expect(page.getByText(businessName)).toBeVisible();
}

async function openDemoAttendeeFromHost(page: Page) {
  const attendeeUrl =
    "http://127.0.0.1:4100/s/dealer-day-demo?demo=1&room=dealer-day-demo&spaceType=store&mode=identified&spaceName=Dealer%20Day&brandName=Vega%20Prime";
  const nextPagePromise = page.context().waitForEvent("page");

  await page.evaluate((url) => {
    window.open(url, "_blank");
  }, attendeeUrl);

  const attendeePage = await nextPagePromise;
  await attendeePage.waitForLoadState("load");
  await attendeePage.waitForTimeout(750);
  return attendeePage;
}

test.describe("Digi host mobile web export", () => {
  test("runs a live room with attendee sync and session summary", async ({ page }) => {
    test.setTimeout(45_000);
    const hostErrors: Error[] = [];
    page.on("pageerror", (error) => hostErrors.push(error));

    await bootstrapDemoWorkspace(page);
    await page.getByRole("button", { name: "Go Live" }).click();

    await expect(page.getByText("Go live", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "90 min" }).click();
    await page.getByRole("button", { name: "Confirm and go live" }).click();

    await expect(page.getByText("M3 Live Panel")).toBeVisible();
    await expect(page.getByText("Nothing pinned yet")).toBeVisible();

    const attendeePage = await openDemoAttendeeFromHost(page);
    const attendeeErrors: Error[] = [];
    attendeePage.on("pageerror", (error) => attendeeErrors.push(error));

    await expect(attendeePage.getByRole("button", { name: "Enter Space" })).toBeVisible();
    await attendeePage.getByRole("button", { name: "Enter Space" }).click();
    await attendeePage.getByLabel("Name").fill("Aarav Shah");
    await attendeePage.getByRole("button", { name: "Continue" }).click();

    await expect(attendeePage.getByText("Dealer Day")).toBeVisible();
    await expect(attendeePage.getByText("Dealer products")).toBeVisible();

    await page.getByRole("button", { name: "Refresh live panel" }).click();
    await expect(page.locator("body")).toContainText("Aarav Shah", { timeout: 8000 });

    await page.getByRole("button", { name: "Pin" }).first().click();

    await expect(page.getByRole("button", { name: "Pinned" })).toBeVisible();
    await expect(attendeePage.getByText("Host pin received")).toBeVisible({ timeout: 6000 });
    await expect(attendeePage.getByText("65W GaN charger dealer pricing").first()).toBeVisible();

    await attendeePage.getByRole("button", { name: "Open pinned item" }).first().click();
    await expect(attendeePage.getByRole("heading", { name: "65W GaN Dual USB-C Charger" })).toBeVisible();
    await attendeePage.getByRole("button", { name: "Save Product Info" }).click();

    await page.getByRole("button", { name: "End live session" }).click();
    await expect(page.getByText("Session summary", { exact: true })).toBeVisible();
    await expect(page.getByText("1 attendees", { exact: true })).toBeVisible();
    await expect(page.locator("body")).toContainText("65W GaN charger dealer pricing");

    await expect(attendeePage.getByText("This live room just closed.")).toBeVisible({ timeout: 6000 });
    await expect(attendeePage.getByText("This live room just closed.")).toBeVisible();

    expect(hostErrors, `Unexpected host page errors: ${hostErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
    expect(attendeeErrors, `Unexpected attendee page errors: ${attendeeErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });

  test("manages operations for analytics, imports, team invites, brands, and spaces", async ({ page }) => {
    test.setTimeout(45_000);
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await bootstrapDemoWorkspace(page, "Atlas Retail");
    await page.getByRole("button", { name: "Open operations" }).click();

    await expect(page.getByText("Operations", { exact: true })).toBeVisible();
    await expect(page.getByText("Pilot health")).toBeVisible();

    await page.getByRole("button", { name: "7 days" }).click();
    await expect(page.getByText("Top spaces")).toBeVisible();

    await page.getByLabel("File name").fill("pilot-import.csv");
    await page
      .getByLabel("CSV payload")
      .fill(
        [
          "space_name,brand_name,content_type,title,subtitle,sku",
          "Dealer Day,Vega Prime,product,65W GaN charger,Dealer offer,VE-CH03",
          "Dealer Day,Unknown Brand,contact,Ananya Reddy,Sales contact,",
        ].join("\n"),
      );
    await page.getByRole("button", { name: "Validate and record import" }).click();
    await expect(page.getByText("pilot-import.csv · Partial")).toBeVisible();
    await expect(page.getByText("brand_name does not match an existing brand")).toBeVisible();

    await page.getByLabel("Invite name").fill("Rhea Sen");
    await page.getByLabel("Invite phone").fill("+91 91111 11111");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.getByText("Rhea Sen")).toBeVisible();

    await page.getByLabel("Brand name").fill("Sunrise Brand");
    await page.getByRole("button", { name: "Create brand profile" }).click();
    await expect(page.getByRole("button", { name: "Sunrise Brand" }).first()).toBeVisible();

    await page.getByLabel("Space name").fill("South Zone Meet-Up");
    await page.getByRole("button", { name: "Sunrise Brand" }).last().click();
    await page.getByRole("button", { name: "Meeting" }).click();
    await page.getByLabel("Default session minutes").fill("45");
    await page.getByRole("button", { name: "Create space" }).click();
    await expect(page.getByText("South Zone Meet-Up")).toBeVisible();

    await page.getByRole("button", { name: "Archive" }).last().click();
    await expect(page.getByText("Archived", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(page.getByText("South Zone Meet-Up")).toHaveCount(0);

    expect(pageErrors, `Unexpected operations page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});
