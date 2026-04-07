# Walk-In Bath Lead Form — Playwright E2E Tests

Automated test suite for the walk-in bath landing page at **https://test-qa.capslock.global/**  
Built with [Playwright](https://playwright.dev/) (TypeScript).

---

## Getting started

```bash
npm install
npx playwright install chromium
npm test
```

### All run commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests headless (default, CI-ready) |
| `npm run test:headed` | Run with a visible browser window |
| `npm run test:ui` | Open Playwright UI — step-through, time-travel, video |
| `npm run test:report` | Open the last HTML report |

Tests run in **parallel** (`fullyParallel: true`, 3 workers locally / 4 in CI).  
No local server or authentication is required.

---

## Project structure

```
tests/
  e2e/
    walkInBath.e2e.ts       # All test cases (TC01–TC07)
  pages/
    WalkInBathPage.ts       # Page Object — 5-step lead form
    ThankYouPage.ts         # Page Object — /thankyou confirmation page
    SafetyStatsPage.ts      # Page Object — external safety statistics link
  constants/
    timeouts.ts             # Shared timeout values
  testData.ts               # All test input constants
playwright.config.ts
BUGS.md                     # Detailed defect report
```

---

## Full list of test scenarios

| # | Scenario | Priority | Automated |
|---|----------|----------|-----------|
| 1 | Full form submission with valid data → redirect to `/thankyou` | **P1 ★** | TC01 |
| 2 | Out-of-area ZIP (11111) → sorry step with notification form | **P1 ★** | TC02 |
| 3 | ZIP must be exactly 5 digits — rejects short and non-numeric values | **P2 ★** | TC03 |
| 4 | Name required + email native HTML5 validation at step 4 | **P2 ★** | TC04 |
| 5 | Phone must be exactly 10 digits — rejects shorter values | **P2 ★** | TC05 |
| 6 | Full happy path on mobile viewport (Pixel 5) | P2 | TC06 |
| 7 | External safety-statistics link is reachable with correct title | P4 | TC07 |
| 8 | Interests step: cannot advance without selecting at least one checkbox | P3 | — |
| 9 | Property type "Rental Property" shows disqualification error | P3 | — |
| 10 | Property type "Mobile Home" shows disqualification error | P3 | — |
| 11 | ZIP longer than 5 digits is rejected | P3 | — |
| 12 | Phone longer than 10 digits is rejected | P3 | — |
| 13 | Sorry-step email field validates email format | P3 | — |
| 14 | Empty ZIP submission is blocked | P3 | — |
| 15 | Empty name submission is blocked | P3 | — |
| 16 | Empty phone submission is blocked | P3 | — |
| 17 | Sorry-step email notification can be submitted | P3 | — |
| 18 | Progress bar increments correctly through all 5 steps | P4 | — |
| 19 | Hero video play/pause button functions correctly | P4 | — |
| 20 | "Show more / Show less" review toggle works | P4 | — |
| 21 | Page title and hero headline are rendered correctly | P4 | — |

---

## Top 5 scenarios — selection and rationale

The five automated scenarios (TC01–TC05) were chosen by asking:
**"If this breaks, does the business lose leads or receive bad data?"**

| # | Test | Reason |
|---|------|--------|
| TC01 | Happy path → Thank You | The entire conversion funnel in a single flow. If submission fails, no leads are captured at all — maximum business impact. |
| TC02 | Out-of-area ZIP routing | A wrong routing decision either drops qualified leads or sends ops after unserviceable ones. Both outcomes damage revenue or ops cost. |
| TC03 | ZIP format validation | The ZIP drives the service-area lookup. A malformed value (< 5 digits, non-numeric) produces incorrect availability results or server errors before a lead is even qualified. |
| TC04 | Name required + email HTML5 validation | Blank names and malformed emails produce dead CRM records — no one to follow up with. Email validation is also an explicit spec requirement. |
| TC05 | Phone 10-digit validation | Phone is passed directly to Twilio for the confirmation call. Fewer than 10 digits produces an invalid E.164 number and a guaranteed failed call. |

P3 / P4 scenarios (rows 8–21) cover secondary flows, edge cases, and UI behaviour. The main funnel works without them, so they are lower priority relative to the five above.

---

## Defects found

See **[BUGS.md](./BUGS.md)** for the full report with reproduction steps.

| ID | Title | Severity |
|----|-------|----------|
| BUG-01 | No back navigation between form steps — users must reload to correct data | High |
| BUG-02 | Hero video plays without audio — consider a GIF for better UX/bandwidth | Low |
| BUG-03 | Confirmation email receipt not specified in docs — no automated coverage possible | Unknown |
| BUG-04 | Name field missing `required` HTML attribute (JS validates, but no HTML fallback) | Low |
| BUG-05 | Sorry-step email uses `type="text"` — native HTML5 email validation is disabled | Medium |
| BUG-06 | ZIP and phone length rely on JS only — no `pattern` / `minlength` / `maxlength` HTML guards | Low |

---

## Ideas for improving the framework

**1. Multi-browser coverage**  
Add Firefox and WebKit projects to `playwright.config.ts`. The page uses CSS animations, custom video playback, and a Slick.js slider — all areas with known cross-browser differences. This requires zero test-code changes.

**2. Mock the ZIP service check**  
Steps 1–3 currently wait for a live external service call to validate the ZIP code. Intercepting this with `page.route()` would make tests faster, deterministic, and independent of network conditions — critical for a reliable CI pipeline.

**3. Visual regression snapshots**  
Use Playwright's built-in `expect(page).toHaveScreenshot()` to catch unintended layout changes in the form steps and the Thank You page. Pair with a baseline stored in the repo so CI fails on visual drift.

**4. Separate test tags for smoke vs. full regression**  
Tag TC01 and TC02 with `@smoke` so a quick pre-deploy check can run in under 30 seconds (`npx playwright test --grep @smoke`), while the full suite runs on schedule or before release.
