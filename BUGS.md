# Bug Report — Walk-In Bath Lead Form

**Page:** https://test-qa.capslock.global/
**Date:** 2026-04-07

---

## BUG-01 — No back navigation between form steps

**Severity:** High — UX / data loss risk
**Type:** Functional

**Description:**
Once a user advances past a form step there is no "Back" button and no other way to return
to a previous step to correct data. The only recovery is a full page reload, which destroys
all previously entered information.

**Steps to reproduce:**
1. Open the page, enter a ZIP code and click Next.
2. Realise the ZIP was wrong.
3. Observe: no Back button exists on step 2; only option is to reload.

**Expected:** A "Back" button on each step (steps 2–5) that returns the user to the
previous step while preserving any already-entered data.

**Impact:** Users who mistype an early answer have no recovery path. They must start over,
which increases drop-off rate.

---

## BUG-02 — Hero video plays without audio

**Severity:** Low — UX / accessibility
**Type:** Content / UX

**Description:**
The hero background video (`heroVideo.mp4`) is intentionally muted (autoplay with no sound).
While technically valid, a silent looping video adds bandwidth cost without delivering a
richer experience than a static image or animated GIF.

**Suggestion:**
- Replace with an optimised GIF or WebP animation for lower bandwidth and broader device
  support, **or**
- Add an optional audio toggle so users who want to hear product narration can enable it.

**Note:** This is a UX/product recommendation, not a blocking defect.

---

## BUG-03 — Confirmation email receipt not specified or tested

**Severity:** Unknown — depends on product requirements
**Type:** Coverage gap / open question

**Description:**
After successful form submission the user is redirected to `/thankyou` with the message
"We will be calling within the next 10 minutes". It is not documented whether:
- a confirmation email is sent to the submitted address, and
- what the expected content/sender of that email should be.

No automated test covers email delivery because the requirement is absent from the spec.

**Recommendation:**
1. Clarify in the spec whether a confirmation email is expected.
2. If yes, add email-delivery tests using a service such as
   [Mailosaur](https://mailosaur.com/) or [Mailhog](https://github.com/mailhog/MailHog).

---

## BUG-04 — Name field missing `required` HTML attribute (mitigated by JS)

**Severity:** Low — defence-in-depth concern
**Type:** Implementation quality

**Description:**
The name `<input>` on step 4 has no `required` HTML attribute:

```html
<input data-name-input name="name" class="inputBlock__input" type="text"
       placeholder="Enter Your Name">
```

All other required fields either carry the `required` attribute or are validated via
radio/checkbox state. The name field relies entirely on JavaScript validation.

**Risk:** If JavaScript fails to load or is bypassed (e.g. in a headless API request),
an empty name passes HTML5 constraint validation and could reach the back end unchecked.

**Expected:** Add `required` attribute to keep validation consistent with other fields.

**Test status:** TC04 confirms JS validation is currently working (blank name is blocked),
so this is a resilience issue rather than a live bug.

---

## BUG-05 — Sorry-step email field uses `type="text"` instead of `type="email"`

**Severity:** Medium — data quality
**Type:** Functional

**Description:**
The email field in the out-of-area notification form uses `type="text"`:

```html
<input data-email-input name="email" type="text" placeholder="Email Address"
       maxlength="255">
```

As a result, native HTML5 email validation is **disabled** for this field. Any string
(e.g. `"notanemail"`, `"@"`, blank) can be submitted.

**Expected per spec:** "Email: must be validated using native HTML5 email validation."

**Impact:** Out-of-area users can submit an invalid email address, making the
notify-me follow-up impossible.

**Fix:** Change `type="text"` → `type="email"` and add `required`.

---

## BUG-06 — ZIP and phone length not enforced by HTML attributes

**Severity:** Low — defence-in-depth concern
**Type:** Implementation quality

**Description:**
Both the ZIP (`data-zip-code-input`, `type="tel"`) and phone (`data-phone-input`,
`type="tel"`) fields rely exclusively on JavaScript to enforce the exact-digit rules.
Neither field has `minlength`, `maxlength`, or a `pattern` attribute.

**Risk:** Same as BUG-04 — if JS is bypassed, malformed values reach the back end.

**Expected:**
- ZIP: add `minlength="5" maxlength="5" pattern="\d{5}"` (or equivalent)
- Phone: add `minlength="10" maxlength="10" pattern="\d{10}"` (or equivalent)

**Test status:** TC03 and TC05 confirm JS validation is currently working.

---

## Summary

| ID | Title | Severity | Type | Test |
|----|-------|----------|------|------|
| BUG-01 | No back navigation between steps | High | Functional | Not automated |
| BUG-02 | Hero video muted / suggest GIF | Low | UX | N/A |
| BUG-03 | Confirmation email not specified or tested | Unknown | Coverage gap | Not automated |
| BUG-04 | Name field missing `required` attribute | Low | Implementation | TC04 (JS validates) |
| BUG-05 | Sorry-step email `type="text"` | Medium | Functional | Not automated |
| BUG-06 | ZIP / phone length not in HTML attributes | Low | Implementation | TC03, TC05 (JS validates) |
