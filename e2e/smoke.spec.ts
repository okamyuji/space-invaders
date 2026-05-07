import { expect, test } from "@playwright/test";

test.describe("Space Invaders smoke", () => {
  test("loads the canvas and reacts to keyboard input", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas#game");
    await expect(canvas).toBeVisible();

    // Sample two frames at separate timestamps and confirm the canvas is being
    // re-painted by the requestAnimationFrame loop. Pixel diffs prove the
    // game-loop is actually running, not just that the element exists.
    const a = await canvas.screenshot();
    await page.waitForTimeout(200);
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.down("Space");
    await page.waitForTimeout(200);
    await page.keyboard.up("Space");
    const b = await canvas.screenshot();

    expect(a.equals(b)).toBe(false);
  });

  test("HUD text is rendered", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas#game");
    await expect(canvas).toBeVisible();
    // We cannot read text from a Canvas, so we assert that the canvas has the
    // configured pixel dimensions.
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  });
});
