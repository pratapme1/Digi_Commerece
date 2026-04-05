import { expect, test, type Page } from "@playwright/test";

async function enableFlutterAccessibility(page: Page) {
  await page.waitForFunction(() => {
    const toggle = document.querySelector('flt-semantics-placeholder[aria-label="Enable accessibility"]');
    if (toggle instanceof HTMLElement) {
      toggle.click();
    }

    return !!document.querySelector('[role="textbox"], [data-semantics-role="text-field"]')
      || !!Array.from(document.querySelectorAll('[role="button"]')).find((node) =>
        (node as HTMLElement).innerText?.includes("Continue with demo workspace"),
      );
  });
}

async function hostField(page: Page, index: number) {
  return page.getByRole("textbox").nth(index);
}

async function setHostField(page: Page, index: number, value: string) {
  const field = await hostField(page, index);
  await field.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(value);
}

async function chooseHostOption(page: Page, name: string) {
  const option = page.getByRole("checkbox", { name });
  await expect(option).toBeVisible();
  if (!(await option.isChecked())) {
    await option.click();
  }
}

async function bootstrapDemoWorkspace(page: Page, businessName = "Vega Auto") {
  await page.goto("http://127.0.0.1:4184/");
  await enableFlutterAccessibility(page);

  await expect(page.getByText("Create your host account")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with demo workspace" })).toBeVisible();
  await page.getByRole("button", { name: "Continue with demo workspace" }).click();

  await expect(page.getByText("Name the business")).toBeVisible();
  await setHostField(page, 0, businessName);
  await chooseHostOption(page, "Store");
  await page.getByRole("button", { name: "Continue to brand setup" }).click();

  await expect(page.getByText("Shape the brand")).toBeVisible();
  await setHostField(page, 0, "Vega Prime");
  await page.getByRole("button", { name: "Continue to space settings" }).click();

  await expect(page.getByText("Configure the first space")).toBeVisible();
  await setHostField(page, 0, "Dealer Day");
  await page.getByRole("button", { name: "Save and generate QR" }).click();

  await expect(page.getByRole("button", { name: "Open dashboard" })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).toContainText("dealer-day-demo");
  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.getByText(businessName)).toBeVisible();
}

async function openDemoAttendeeFromHost(page: Page) {
  const nextPagePromise = page.context().waitForEvent("page");
  await page.getByRole("button", { name: "Open attendee space" }).click();
  const attendeePage = await nextPagePromise;
  await attendeePage.waitForLoadState("load");
  return attendeePage;
}

test.describe("Digi Flutter host web build", () => {
  test("runs a live room with attendee sync and session summary", async ({ page }) => {
    test.setTimeout(60_000);
    const hostErrors: Error[] = [];
    page.on("pageerror", (error) => hostErrors.push(error));

    await bootstrapDemoWorkspace(page);
    await page.getByRole("button", { name: "Go Live" }).click();
    await expect(page.getByText("Go live", { exact: true })).toBeVisible();
    await chooseHostOption(page, "90 min");
    await page.getByRole("button", { name: "Confirm and go live" }).click();

    await expect(page.getByText("Pin controls")).toBeVisible();
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
    await expect(page.locator("body")).toContainText("Aarav Shah", { timeout: 8_000 });

    await page.getByRole("button", { name: "Pin" }).first().click();
    await expect(page.getByRole("button", { name: "Pinned" })).toBeVisible();

    await expect(attendeePage.getByText("Host pin received")).toBeVisible({ timeout: 6_000 });
    await attendeePage.getByRole("button", { name: "Open pinned item" }).first().click();
    await expect(attendeePage.getByRole("heading", { name: "65W GaN Dual USB-C Charger" })).toBeVisible();
    await attendeePage.getByRole("button", { name: "Save Product Info" }).click();

    await page.getByRole("button", { name: "End live session" }).click();
    await expect(page.getByText("Session summary", { exact: true })).toBeVisible();
    await expect(page.getByText("1 attendees", { exact: true })).toBeVisible();
    await expect(page.locator("body")).toContainText("65W GaN Dual USB-C Charger");

    await expect(attendeePage.getByText("This live room just closed.")).toBeVisible({ timeout: 6_000 });

    expect(hostErrors, `Unexpected host page errors: ${hostErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
    expect(attendeeErrors, `Unexpected attendee page errors: ${attendeeErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });

  test("manages imports, team invites, brands, and scoped spaces", async ({ page }) => {
    test.setTimeout(60_000);
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await bootstrapDemoWorkspace(page, "Atlas Retail");
    await page.getByRole("button", { name: "Open operations" }).click();

    await expect(page.getByText("Operations", { exact: true })).toBeVisible();
    await expect(page.getByText("Pilot health")).toBeVisible();

    await setHostField(page, 0, "attendee-catalog.csv");
    await setHostField(
      page,
      1,
      [
        "space_name,brand_name,content_type,title,subtitle,sku",
        "Dealer Day,Vega Prime,product,Importer Spotlight Bundle,Pilot offer pricing,AT-BUNDLE-01",
        "Dealer Day,Vega Prime,contact,Rhea Sen,Regional sales lead,",
      ].join("\n"),
    );
    await page.getByRole("button", { name: "Validate and record import" }).click();
    await expect(page.getByText("attendee-catalog.csv · Validated")).toBeVisible();

    await setHostField(page, 2, "Rhea Sen");
    await setHostField(page, 3, "+91 91111 11111");
    await chooseHostOption(page, "Admin");
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.locator("body")).toContainText("Rhea Sen");

    await setHostField(page, 4, "Sunrise Brand");
    await page.getByRole("button", { name: "Create brand profile" }).click();
    await expect(page.getByRole("checkbox", { name: "Sunrise Brand" })).toBeVisible();

    await setHostField(page, 5, "South Zone Meet-Up");
    await chooseHostOption(page, "Business Card");
    await setHostField(page, 6, "45");
    await page.getByRole("button", { name: "Create space" }).click();
    await expect(page.locator("body")).toContainText("South Zone Meet-Up · Business Card");

    await page.getByRole("button", { name: "Archive" }).first().click();
    await expect(page.locator("body")).toContainText("Archived");

    await page.getByRole("button", { name: "Delete" }).first().click();
    await expect(page.locator("body")).not.toContainText("South Zone Meet-Up · Business Card");

    expect(pageErrors, `Unexpected operations page errors: ${pageErrors.map((error) => error.message).join("; ")}`).toHaveLength(0);
  });
});
