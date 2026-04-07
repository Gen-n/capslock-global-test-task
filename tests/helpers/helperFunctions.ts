import type { Frame, Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  ELEMENT_VISIBILITY_TIMEOUT,
  PAGE_LOAD_TIMEOUT,
} from "../constants/timeouts";

export const waitForPageFullyLoaded = async (
  page: Page | Frame
): Promise<void> => {
  if (!page || (page as Frame).isDetached?.()) {
    throw new Error("The page or frame is no longer available");
  }
  await page.waitForFunction(() => document.readyState === "complete");
  await page.evaluate(() => new Promise(requestAnimationFrame));
};

export const navigateToPage = async (
  page: Page | Frame,
  url: string
): Promise<void> => {
  await page.goto(url);
  await waitForPageFullyLoaded(page);
};

type ClickOptions = {
  force?: boolean;
  waitForDisabled?: boolean;
};

export const click = async (
  page: Page | Frame,
  locator: string | Locator,
  options: ClickOptions = {}
): Promise<void> => {
  const { force = false, waitForDisabled = false } = options;

  const elementLocator =
    typeof locator === "string" ? page.locator(locator).first() : locator.first();

  await elementLocator.click({ force });

  if (waitForDisabled) {
    const settled = await Promise.race([
      expect(elementLocator)
        .toBeDisabled({ timeout: 5000 })
        .then(() => "disabled" as const),
      elementLocator
        .waitFor({ state: "hidden", timeout: 5000 })
        .then(() => "hidden" as const),
    ]).catch(() => "visible" as const);

    if (settled === "visible") {
      await elementLocator.click({ force: true });
    }
  }

  await waitForPageFullyLoaded(page);
};

export const AssertionType = {
  toBeDisabled: "toBeDisabled",
  toBeEnabled: "toBeEnabled",
  toBeVisible: "toBeVisible",
  toContainText: "toContainText",
} as const;

type AssertionTypeKey = keyof typeof AssertionType;

export const validateElement = async (
  locator: Locator,
  assertion: AssertionTypeKey,
  label: string,
  timeout: number = ELEMENT_VISIBILITY_TIMEOUT,
  options?: { text?: string }
): Promise<void> => {
  console.log(`Validating element: ${label} — assertion: ${assertion}`);
  switch (assertion) {
    case "toBeDisabled":
      await expect(locator).toBeDisabled({ timeout });
      break;
    case "toBeEnabled":
      await expect(locator).toBeEnabled({ timeout });
      break;
    case "toBeVisible":
      await expect(locator).toBeVisible({ timeout });
      break;
    case "toContainText":
      if (!options?.text) throw new Error("toContainText requires options.text");
      await expect(locator).toContainText(options.text, { timeout });
      break;
  }
};
