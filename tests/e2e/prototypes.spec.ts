import { expect, test } from "@playwright/test";

test.describe("Spaces guest prototype", () => {
  test("loads and switches primary navigation states", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/spaces_final.html");

    await expect(page).toHaveTitle("Spaces");
    await expect(page.locator(".nav button")).toHaveCount(4);
    await expect(page.locator("#cs")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("#ms")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Products" }).click();
    await expect(page.locator("#ps")).toHaveClass(/on/);

    await page.getByRole("button", { name: "Next →" }).click();
    await expect(page.locator("#pcount")).toHaveText("2 / 6");

    await page.getByRole("button", { name: "Live Event" }).click();
    await expect(page.locator("#ls")).toHaveClass(/on/);

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
