import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const coreRoutes = ["/", "/docs/getting-started", "/changelog"];

for (const route of coreRoutes) {
  test(`${route} has a usable document structure`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });

    expect(response?.ok()).toBe(true);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    const reflow = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      candidates: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return (
            (bounds.right > window.innerWidth + 1 || bounds.left < -1) &&
            !element.closest(".content-scroll-region")
          );
        })
        .slice(0, 10)
        .map((element) => ({
          element: element.tagName.toLowerCase(),
          className: element.className,
          text: element.textContent?.slice(0, 80),
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        })),
    }));
    expect(
      reflow.documentWidth,
      `Overflow candidates: ${JSON.stringify(reflow.candidates)}`
    ).toBeLessThanOrEqual(reflow.viewportWidth + 1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const releaseBlockingViolations = accessibility.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious"
    );
    expect(releaseBlockingViolations).toEqual([]);
  });
}

test("search traps focus, closes with Escape, and restores focus", async ({
  page,
}) => {
  await page.goto("/docs/getting-started");
  const opener = page.getByRole("button", { name: "Search docs" });
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Search documentation" })
  ).toBeFocused();

  for (let index = 0; index < 8; index += 1) await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((element) => element.contains(document.activeElement))
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("the demo video autoplays when reduced motion is requested", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const video = page.locator("video");

  await expect(video).toHaveAttribute("src", /Demo\.mp4$/);
  await expect(video).toHaveAttribute("autoplay", "");
  await context.close();
});

test("production responses expose discovery and security policy", async ({
  page,
}) => {
  const response = await page.goto("/");
  const headers = response?.headers() ?? {};

  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'"
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://sythoria.com"
  );

  for (const route of [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
  ]) {
    const discoveryResponse = await page.request.get(route);
    expect(discoveryResponse.ok()).toBe(true);
  }
});
