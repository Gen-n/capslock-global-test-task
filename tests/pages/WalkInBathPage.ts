import { type Page, type Locator, expect } from "@playwright/test";
import { ELEMENT_VISIBILITY_TIMEOUT, FORM_STEP_TRANSITION_TIMEOUT } from "../constants/timeouts";

export class WalkInBathPage {
  readonly page: Page;

  // Root container — the page has two form containers; we always target the first
  private readonly root: Locator;

  // ─── Step containers ─────────────────────────────────────────────────────────
  readonly step1: Locator;
  readonly step2: Locator;
  readonly step3: Locator;
  readonly step4: Locator;
  readonly step5: Locator;
  readonly stepSorry: Locator;

  // ─── Step 1: ZIP code ─────────────────────────────────────────────────────────
  readonly zipInput: Locator;
  readonly step1SubmitBtn: Locator;
  readonly zipErrorBlock: Locator;

  // ─── Step 2: Interests ────────────────────────────────────────────────────────
  readonly step2SubmitBtn: Locator;

  // ─── Step 3: Property type ────────────────────────────────────────────────────
  readonly step3SubmitBtn: Locator;
  readonly propertyErrorBlock: Locator;

  // ─── Step 4: Name & email ─────────────────────────────────────────────────────
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly step4SubmitBtn: Locator;

  // ─── Step 5: Phone ────────────────────────────────────────────────────────────
  readonly phoneInput: Locator;
  readonly step5SubmitBtn: Locator;
  readonly phoneErrorBlock: Locator;

  // ─── Sorry step ───────────────────────────────────────────────────────────────
  readonly sorryEmailInput: Locator;
  readonly sorrySubmitBtn: Locator;
  readonly sorryMessageText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Scope to form-container-1 — avoids strict-mode violations caused by the
    // duplicate form container (#form-container-2) that also exists on the page.
    this.root = page.locator("#form-container-1");

    this.step1 = this.root.locator(".step-1");
    this.step2 = this.root.locator(".step-2");
    this.step3 = this.root.locator(".step-3");
    this.step4 = this.root.locator(".step-4");
    this.step5 = this.root.locator(".step-5");
    this.stepSorry = this.root.locator("[data-sorry-step]");

    // data-* selectors are most stable — tied to JS behaviour, not CSS
    this.zipInput = this.root.locator("[data-zip-code-input]");
    this.step1SubmitBtn = this.root.locator("form[name='zip_code'] button[type='submit']");
    this.zipErrorBlock = this.root.locator("form[name='zip_code'] [data-error-block]");

    this.step2SubmitBtn = this.root.locator("form[name='why_interested'] button[type='submit']");

    this.step3SubmitBtn = this.root.locator(
      "form[name='type_of_property'] button[type='submit']"
    );
    this.propertyErrorBlock = this.root.locator(
      "form[name='type_of_property'] [data-error-block]"
    );

    this.nameInput = this.root.locator("[data-name-input]");
    this.emailInput = this.root.locator("input[name='email'][type='email']");
    this.step4SubmitBtn = this.root.locator(
      "form[name='name_and_email'] button[type='submit']"
    );

    this.phoneInput = this.root.locator("[data-phone-input]");
    this.step5SubmitBtn = this.root.locator("form[name='phone'] button[type='submit']");
    this.phoneErrorBlock = this.root.locator("form[name='phone'] [data-error-block]");

    this.sorryEmailInput = this.root.locator("[data-sorry-step] [data-email-input]");
    this.sorrySubmitBtn = this.root.locator("[data-sorry-step] button[type='submit']");
    this.sorryMessageText = this.root.locator("[data-sorry-step] .stepTitle__hdr").first();
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForFunction(() => document.readyState === "complete");
  }

  /** Wait for a form step to become visible after a transition. */
  async waitForStep(step: Locator, timeout = FORM_STEP_TRANSITION_TIMEOUT): Promise<void> {
    await step.waitFor({ state: "visible", timeout });
  }

  // ─── Step helpers ─────────────────────────────────────────────────────────────

  async submitZip(zip: string): Promise<void> {
    await this.zipInput.fill(zip);
    await this.step1SubmitBtn.click();
  }

  async selectInterest(value: string): Promise<void> {
    // The <input> is CSS-hidden; click the associated <label> which is the visible target
    await this.step2.locator("label").filter({ hasText: value }).click();
  }

  async submitInterests(): Promise<void> {
    await this.step2SubmitBtn.click();
  }

  async selectPropertyType(value: string): Promise<void> {
    // Same pattern: radio <input> is CSS-hidden; click its visible <label>
    await this.step3.locator("label").filter({ hasText: value }).click();
  }

  async submitPropertyType(): Promise<void> {
    await this.step3SubmitBtn.click();
  }

  async submitNameAndEmail(name: string, email: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.step4SubmitBtn.click();
  }

  async submitPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
    await this.step5SubmitBtn.click();
  }

  // ─── Composite flows ──────────────────────────────────────────────────────────

  /** Navigate through steps 1–3, ending on step 4 visible. */
  async navigateToStep4(data: {
    zip: string;
    interest: string;
    propertyType: string;
  }): Promise<void> {
    await this.submitZip(data.zip);
    await this.waitForStep(this.step2);
    await this.selectInterest(data.interest);
    await this.submitInterests();
    await this.waitForStep(this.step3);
    await this.selectPropertyType(data.propertyType);
    await this.submitPropertyType();
    await this.waitForStep(this.step4);
  }

  /** Navigate through steps 1–4, ending on step 5 visible. */
  async navigateToStep5(data: {
    zip: string;
    interest: string;
    propertyType: string;
    name: string;
    email: string;
  }): Promise<void> {
    await this.navigateToStep4(data);
    await this.submitNameAndEmail(data.name, data.email);
    await this.waitForStep(this.step5);
  }

  /** Navigate through all 5 steps and submit the phone number. */
  async completeFullForm(data: {
    zip: string;
    interest: string;
    propertyType: string;
    name: string;
    email: string;
    phone: string;
  }): Promise<void> {
    await this.navigateToStep5(data);
    await this.submitPhone(data.phone);
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async expectSorryStepVisible(): Promise<void> {
    await this.waitForStep(this.stepSorry);
    await expect(this.stepSorry).toBeVisible({ timeout: ELEMENT_VISIBILITY_TIMEOUT });
    await expect(this.sorryMessageText).toContainText(
      /unfortunately we don.t yet install in your area/,
      { timeout: ELEMENT_VISIBILITY_TIMEOUT }
    );
  }

  async expectZipError(): Promise<void> {
    await expect(this.zipErrorBlock).not.toBeEmpty({ timeout: ELEMENT_VISIBILITY_TIMEOUT });
  }

  async expectPhoneError(): Promise<void> {
    await expect(this.phoneErrorBlock).not.toBeEmpty({ timeout: ELEMENT_VISIBILITY_TIMEOUT });
  }

  async expectNameError(): Promise<void> {
    const nameError = this.root
      .locator("form[name='name_and_email'] [data-error-block]")
      .first();
    await expect(nameError).not.toBeEmpty({ timeout: ELEMENT_VISIBILITY_TIMEOUT });
  }
}
