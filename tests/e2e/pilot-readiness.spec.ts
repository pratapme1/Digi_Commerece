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

async function bootstrapDemoWorkspace(page: Page) {
  await page.goto("http://127.0.0.1:4184/");
  await enableFlutterAccessibility(page);
  await expect(page.getByText("Create your host account")).toBeVisible();

  await page.getByRole("button", { name: "Continue with demo workspace" }).click();
  await setHostField(page, 0, "Pilot Ops");
  await chooseHostOption(page, "Store");
  await page.getByRole("button", { name: "Continue to brand setup" }).click();
  await setHostField(page, 0, "Pilot Prime");
  await page.getByRole("button", { name: "Continue to space settings" }).click();
  await setHostField(page, 0, "Pilot Room");
  await page.getByRole("button", { name: "Save and generate QR" }).click();
  await expect(page.getByRole("button", { name: "Open dashboard" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.getByText("Pilot Ops")).toBeVisible();
}

test.describe("Pilot readiness", () => {
  test("stays within local pilot budgets for host and attendee entry", async ({ page }) => {
    test.setTimeout(45_000);

    const hostStart = Date.now();
    await page.goto("http://127.0.0.1:4184/");
    await enableFlutterAccessibility(page);
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

    expect(hostShellMs).toBeLessThan(6_500);
    expect(operationsTransitionMs).toBeLessThan(2_000);
    expect(attendeeEntryMs).toBeLessThan(8_000);
  });

  test("keeps destructive admin actions disabled until a second space exists", async ({ page }) => {
    await bootstrapDemoWorkspace(page);
    await page.getByRole("button", { name: "Open operations" }).click();

    await expect(page.getByText("Operations", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Validated");
  });
});
