import { type Page, expect } from "@playwright/test";

/**
 * External safety-statistics page linked from the walk-in bath landing page.
 * Used to verify the link target is reachable and has the expected title.
 */
export class SafetyStatsPage {
  static readonly URL =
    "https://showerbay.com/bathroom-slips-falls-top-causes-injuries-elderly";
  static readonly EXPECTED_TITLE =
    /Bathroom Slips And Falls.*Top Causes.*Injuries/i;

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(SafetyStatsPage.URL);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(SafetyStatsPage.EXPECTED_TITLE, {
      timeout: 15000,
    });
  }
}
