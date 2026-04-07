# Walk-In Bath QA — Playwright Reference

## Overview

Reference for QA testing the walk-in bath lead-generation page at **https://test-qa.capslock.global/**
using either the Playwright test runner (`npm run test:walkinbath`) or Playwright MCP browser tools
for interactive exploration.

---

## 1. Running Tests

```bash
npm test                  # headless (CI)
npm run test:headed       # watch the browser
npm run test:ui           # interactive step-through / time-travel
npm run test:report       # open last HTML report
```

Config: `playwright.config.ts` — no auth, `baseURL = https://test-qa.capslock.global`

---

## 2. Form Structure

5-step multi-step form. Steps are shown/hidden via `style="display: block/none"`.

| Step | Class | Form name | Key field |
|------|-------|-----------|-----------|
| 1 | `.step-1` | `zip_code` | `[data-zip-code-input]` — ZIP code |
| 2 | `.step-2` | `why_interested` | `input[name="whyInterested[]"]` — checkboxes |
| 3 | `.step-3` | `type_of_property` | `input[name="typeOfProperty"]` — radio buttons |
| 4 | `.step-4` | `name_and_email` | `[data-name-input]`, `input[name='email'][type='email']` |
| 5 | `.step-5` | `phone` | `[data-phone-input]` — phone number |
| Sorry | `[data-sorry-step]` | `sorry_email` | `[data-email-input]` — notification email |

**ZIP routing:**
- `68901` → "Congratulations! We service your area" → advances to step 2
- `11111` → out-of-area → `.step-sorry` shown

**Thank You page:** `/thankyou`

---

## 3. Key Selectors

Prefer `data-*` attributes — they're tied to JS behaviour, not CSS layout.

| Element | Selector |
|---------|----------|
| ZIP input | `[data-zip-code-input]` |
| ZIP submit | `form[name='zip_code'] button[type='submit']` |
| ZIP error | `form[name='zip_code'] [data-error-block]` |
| Interest checkbox | `input[name="whyInterested[]"][value="Independence"]` |
| Property radio | `input[name="typeOfProperty"][value="Owned House / Condo"]` |
| Name input | `[data-name-input]` |
| Email input | `input[name='email'][type='email']` |
| Phone input | `[data-phone-input]` |
| Phone submit | `form[name='phone'] button[type='submit']` |
| Phone error | `form[name='phone'] [data-error-block]` |
| Sorry step | `[data-sorry-step]` |
| Sorry email | `[data-sorry-step] [data-email-input]` |

---

## 4. Playwright MCP Tools — Quick Reference

Use these for **interactive exploration and debugging** (not in CI test files).

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get accessibility tree with element refs |
| `browser_click` | Click by `ref` from snapshot |
| `browser_type` | Type text into element |
| `browser_wait_for` | Wait for text / text to disappear / N seconds |
| `browser_take_screenshot` | Capture current state |
| `browser_console_messages` | Check for JS errors (use `level: "error"`) |
| `browser_evaluate` | Run arbitrary JavaScript |

**Always snapshot before interacting** — refs come from the accessibility tree snapshot.

### Interactive exploration example

```
1. browser_navigate({ url: "https://test-qa.capslock.global/" })
2. browser_snapshot({})                         // find form refs
3. browser_type({ ref: "<zip-ref>", text: "68901" })
4. browser_click({ ref: "<next-btn-ref>", element: "ZIP next button" })
5. browser_wait_for({ text: "Congratulations" }) // wait for service check
6. browser_snapshot({})                          // verify step 2 visible
7. browser_console_messages({ level: "error" })  // check for JS errors
```

### Checking the sorry step

```
1. browser_navigate({ url: "https://test-qa.capslock.global/" })
2. browser_snapshot({})
3. browser_type({ ref: "<zip-ref>", text: "11111" })
4. browser_click({ ref: "<next-btn-ref>", element: "ZIP next button" })
5. browser_wait_for({ text: "unfortunately we don't yet install" })
6. browser_snapshot({})   // verify [data-sorry-step] is visible
```

---

## 5. Known Defects (see README.md for full details)

| ID | Location | Issue |
|----|----------|-------|
| DEFECT-01 | Step 4, name field | Missing `required` attribute — blank names may pass |
| DEFECT-02 | Sorry step email | `type="text"` instead of `type="email"` — no HTML5 validation |
| DEFECT-03 | Steps 1 & 5 | ZIP/phone length enforcement depends on JS only — no HTML attr guard |

---

## 6. External Links on Page

| Link text / context | URL | Status |
|--------------------|-----|--------|
| Safety statistics source | https://showerbay.com/bathroom-slips-falls-top-causes-injuries-elderly | ✅ 200 OK |
