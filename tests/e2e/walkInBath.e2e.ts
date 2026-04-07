import { test, expect, devices } from "@playwright/test";
import { WalkInBathPage } from "../pages/WalkInBathPage";
import { ThankYouPage } from "../pages/ThankYouPage";
import { SafetyStatsPage } from "../pages/SafetyStatsPage";
import {
  validServiceZip,
  outOfAreaZip,
  shortZip,
  nonNumericZip,
  validInterest,
  validPropertyType,
  validName,
  validEmail,
  invalidEmail,
  validPhone,
  shortPhone,
} from "../testData";

// ─── Shared default form data ─────────────────────────────────────────────────

const defaultFormData = {
  zip: validServiceZip,
  interest: validInterest,
  propertyType: validPropertyType,
  name: validName,
  email: validEmail,
  phone: validPhone,
};

// ─── Desktop tests ────────────────────────────────────────────────────────────

test.describe("Walk-In Bath Lead Form", () => {
  let form: WalkInBathPage;

  test.beforeEach(async ({ page }) => {
    form = new WalkInBathPage(page);
    await form.goto();
  });

  /**
   * TC01 — HAPPY PATH
   * Priority: P1 — validates the entire conversion funnel end-to-end.
   */
  test("TC01: completes all 5 steps with valid data and lands on Thank You page", async ({
    page,
  }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await test.step("Complete all 5 form steps", async () => {
      await form.completeFullForm(defaultFormData);
    });

    await test.step("Verify Thank You page loads with confirmation message", async () => {
      const thankYou = new ThankYouPage(page);
      await thankYou.expectLoaded();
    });

    await test.step("Verify no uncaught JS errors occurred", async () => {
      expect(jsErrors, `Unexpected JS errors: ${jsErrors.join("; ")}`).toHaveLength(0);
    });
  });

  /**
   * TC02 — OUT-OF-AREA ZIP ROUTING
   * Priority: P1 — determines lead-qualification branching.
   */
  test("TC02: out-of-area ZIP (11111) shows the sorry step with correct message", async () => {
    await test.step(`Submit out-of-area ZIP: ${outOfAreaZip}`, async () => {
      await form.submitZip(outOfAreaZip);
    });

    await test.step("Verify sorry step is shown and form does not advance", async () => {
      await form.expectSorryStepVisible();
      await expect(form.step2).not.toBeVisible();
    });
  });

  /**
   * TC03 — ZIP CODE FORMAT VALIDATION
   * Priority: P2 — malformed ZIPs break the service-area lookup.
   * Spec: "must consist of exactly 5 digits".
   */
  test("TC03: ZIP code must be exactly 5 digits — rejects short and non-numeric values", async () => {
    await test.step(`Submit 4-digit ZIP (${shortZip}) and verify error`, async () => {
      await form.zipInput.fill(shortZip);
      await form.step1SubmitBtn.click();
      await form.expectZipError();
      await expect(form.step2).not.toBeVisible();
      await form.zipInput.clear();
    });

    await test.step(`Submit non-numeric ZIP (${nonNumericZip}) and verify error`, async () => {
      await form.zipInput.fill(nonNumericZip);
      await form.step1SubmitBtn.click();
      await form.expectZipError();
      await expect(form.step2).not.toBeVisible();
    });
  });

  /**
   * TC04 — STEP 4 REQUIRED FIELD AND EMAIL FORMAT VALIDATION
   * Priority: P2 — ensures CRM receives complete, correctly formatted contact data.
   * See BUGS.md BUG-04 regarding the missing `required` HTML attribute on name.
   */
  test("TC04: step 4 rejects blank name and invalid email format", async () => {
    await test.step("Navigate to step 4 via steps 1–3", async () => {
      await form.navigateToStep4(defaultFormData);
    });

    await test.step("Verify blank name is rejected", async () => {
      await form.emailInput.fill(validEmail);
      await form.step4SubmitBtn.click();
      await form.expectNameError();
      await expect(form.step5).not.toBeVisible();
    });

    await test.step(`Verify invalid email (${invalidEmail}) is rejected via HTML5 validation`, async () => {
      await form.nameInput.fill(validName);
      await form.emailInput.fill(invalidEmail);
      await form.step4SubmitBtn.click();
      // HTML5 Constraint Validation API — browser blocks submission and shows native tooltip
      const isEmailValid = await form.emailInput.evaluate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el: any) => (el as { validity: { valid: boolean } }).validity.valid
      );
      expect(isEmailValid).toBe(false);
      await expect(form.step5).not.toBeVisible();
    });
  });

  /**
   * TC05 — PHONE NUMBER 10-DIGIT VALIDATION
   * Priority: P2 — fewer than 10 digits produces an invalid Twilio E.164 number.
   * Spec: "must contain exactly 10 digits".
   */
  test("TC05: phone number with fewer than 10 digits is rejected", async () => {
    await test.step("Navigate to step 5 via steps 1–4", async () => {
      await form.navigateToStep5(defaultFormData);
    });

    await test.step(`Submit 9-digit phone (${shortPhone}) and verify error`, async () => {
      await form.phoneInput.fill(shortPhone);
      await form.step5SubmitBtn.click();
      await form.expectPhoneError();
      await expect(form.page).not.toHaveURL(/\/thankyou/);
    });
  });
});

// ─── Mobile tests ─────────────────────────────────────────────────────────────

/**
 * TC06 — MOBILE VIEWPORT (Pixel 5)
 * Priority: P2 — the page ships separate mobile video assets and responsive CSS.
 */
test.describe("Walk-In Bath Lead Form — Mobile (Pixel 5)", () => {
  // defaultBrowserType cannot be set inside a describe group — omit it
  const { defaultBrowserType: _browserType, ...pixel5Settings } = devices["Pixel 5"];
  test.use(pixel5Settings);

  test("TC06: happy path on mobile viewport completes and lands on Thank You page", async ({
    page,
  }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    const form = new WalkInBathPage(page);

    await test.step("Load page and verify form is visible on mobile", async () => {
      await form.goto();
      await expect(form.step1).toBeVisible();
    });

    await test.step("Complete all 5 form steps on mobile", async () => {
      await form.completeFullForm(defaultFormData);
    });

    await test.step("Verify Thank You page loads with confirmation message", async () => {
      const thankYou = new ThankYouPage(page);
      await thankYou.expectLoaded();
    });

    await test.step("Verify no uncaught JS errors occurred", async () => {
      expect(jsErrors, `Unexpected JS errors: ${jsErrors.join("; ")}`).toHaveLength(0);
    });
  });
});

// ─── External links ───────────────────────────────────────────────────────────

/**
 * TC07 — EXTERNAL SAFETY STATISTICS LINK
 * Priority: P4 — broken external links undermine content credibility.
 */
test.describe("External Links", () => {
  test("TC07: safety statistics link is reachable and has the expected page title", async ({
    page,
  }) => {
    const statsPage = new SafetyStatsPage(page);

    await test.step("Navigate to safety statistics page", async () => {
      await statsPage.goto();
    });

    await test.step("Verify page title matches expected content", async () => {
      await statsPage.expectTitle();
    });
  });
});
