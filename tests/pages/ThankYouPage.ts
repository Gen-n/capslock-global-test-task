import { type Page, type Locator, expect } from "@playwright/test";
import { FORM_STEP_TRANSITION_TIMEOUT } from "../constants/timeouts";

export class ThankYouPage {
  static readonly PATH = "/thankyou";
  static readonly CONFIRMATION_TEXT = "We will be calling within the next 10 minutes";

  readonly page: Page;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationMessage = page.getByText(ThankYouPage.CONFIRMATION_TEXT);
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForURL(/\/thankyou/, { timeout: FORM_STEP_TRANSITION_TIMEOUT });
    await expect(this.page).toHaveURL(/\/thankyou/);
    await expect(this.confirmationMessage).toBeVisible({ timeout: FORM_STEP_TRANSITION_TIMEOUT });
  }
}
