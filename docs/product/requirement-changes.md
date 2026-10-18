# Requirement changes after Phase 0 approval

The Phase 0 blueprint (`Kindred_Phase0_Final_Closed_rev355`, approved 2026-10-17) is the baseline.
Requirements the founder adds or changes afterwards are logged here, newest first, with their IDs in
[traceability.md](traceability.md). Each entry says what changed, why, which approved rules it touches,
and what it does not change.

## 2026-10-18: Splash and Log In frame exports are the visual baseline

**Decided by:** the founder, who supplied the Mobile – Splash and Mobile – Log In frames (402 × 874) as
the approved references for criterion 3 and asked for the build to match them.

- Layout now follows the frames: the compact centred Log In button (hugs its label, 107 × 52), fields
  199 pt wide ending at x 371, labels at x 32 in Inter Regular 24, "Forgot your password?" in Inter
  Regular 16 Charcoal without underline, and the frames' vertical positions (content placed from the
  top of the screen, not centred).
- These replace the brief's spacing and typography Defaults (24 pt margins, 48 pt brand-to-form gap,
  Medium 16 labels, underlined link, full-width button, vertically centred content).
- Kept as approved: `#767676` resting and 2 pt `#A94F32` focused borders, the `#A94F32` button with white
  text, no placeholder text, the responsive and accessibility precedence rules.
- Not underlined: "Forgot your password?" (founder, 2026-10-18), with its 48 pt touch target kept.
- Unverified, because a PNG cannot show font properties: the labels' font (built as Inter Regular 24) and
  the wordmark's letter spacing (built as 0.7 pt, inferred from the image). Both tokens are flagged
  `placeholder` until read from Figma.
- Unchanged: acceptance criteria, approved colours and the approved type sizes.

## 2026-10-18: Focused fields show a 2 pt `#A94F32` outline

**Decided by:** the founder, as Kindred's original design intent.

- Both Log In fields: resting border 1 px solid `#767676`; focused or selected border **2 px solid
  `#A94F32`**; White `#FFFFFF` fill; 12 px corner radius; empty by default with no placeholder text.
- This replaces the Terracotta `#C96A4A` focus colour approved on 2026-10-17. `#A94F32` is the same
  accessible variant already approved for the Log In button (B1), so the token
  `color.border.focus` now points to `color.brand.terracottaButton`.
- The orange focus outline is intentional design, not an accessibility defect.
- Accessibility: contrast rises from 3.60:1 to **5.27:1** against Warm White and from 3.72:1 to
  **5.45:1** against White (WCAG 1.4.11 needs 3:1). Focus is still shown by the 1 pt to 2 pt change in
  thickness as well as colour (WCAG 2.4.7), and keyboard focus triggers it the same way as a tap.
- Unchanged: acceptance criteria, the layout, the brand colour Terracotta `#C96A4A`, and every other
  approved value.

## 2026-10-17: Log In layout confirmed against Figma (Q1 and Q2 resolved)

**Confirmed by:** the founder, directly against the Mobile – Log In frame in Figma. Nothing is
implemented.

- **Q1:** "Username:" and "Password:" are to the **left** of their fields. Keep this side-by-side
  arrangement where it fits without clipping; at larger accessibility text sizes or constrained widths
  the labels stack above their fields.
- **Q2:** above the fields is the centred "Kindred" wordmark with "Care for Every Chapter." directly
  beneath. There is **no** separate "Log In" heading; "Log In" appears only on the primary button.
- **Layout:** Username above Password; the Log In button below both fields; "Forgot your password?"
  centred beneath the button; the existing Figma spacing and composition preserved.
- **Accessibility:** the approved corrections (`#A94F32` button fill, `#767676` field borders, a thicker
  2 pt focused-field border) supersede the original Figma colours where they apply.

No design question remains open. To measure criterion 3 within the approved ±2 pt tolerance, the build
needs PNG exports of the Splash and Log In frames (prerequisite P1 in [the design brief](../design/m1-figma-brief.md)).

## 2026-10-17: Visual-match tolerance for criterion 3 (approved); layout questions kept open

**Decided by:** the founder. Nothing is implemented.

- **B3 approved:** component positions and dimensions must match the Figma within **±2 pt** at both the
  390 pt and 402 pt reference widths. Brand colours, typography and accessibility requirements stay
  exactly as approved. Responsive behaviour, safe areas and accessibility text scaling take precedence
  over rigid pixel matching.
- **Q1 and Q2 stay open** until the founder confirms the actual Figma layout. No label position is
  assumed, and no branding element is added that is not in the mockup.
- Milestone 1's acceptance criteria are unchanged; this supplies the "agreed tolerance" that criterion 3
  refers to.

Details: [the design brief, sections 6 and 6b](../design/m1-figma-brief.md).

## 2026-10-17: Contrast corrections for the Log In screen (approved)

**Proposed and approved by:** the founder, to keep the approved design as close as possible.
**Status:** measured, documented and **approved on 2026-10-17**, including focus shown by thickening the
field border to 2 pt. Nothing is implemented until the founder authorizes implementation.

- **B1:** a button-specific darker Terracotta `#A94F32` for the Log In fill. White text on it is
  5.45:1 (needs 4.5:1). Brand Terracotta `#C96A4A` remains the primary brand colour.
- **B2:** field border `#767676`: 4.54:1 against the White field and 4.39:1 against the Warm White page
  (needs 3:1).
- Focus: against the grey border a Terracotta focus colour differs by only about 1.2:1, so focus is shown
  by thickening the border from 1 pt to 2 pt (approved), not by colour alone.

Details: [the design brief, section 6a](../design/m1-figma-brief.md).

## 2026-10-17: Milestone 1 visual design baseline approved (decided)

**Decided by:** the founder, after reviewing the designs directly in Figma. **Scope:** Milestone 1 splash
and Log In screens (criteria 2, 3 and 4). Implementation waits for the founder's authorization.

- Brand identity, colours and typography approved: Kindred, "Care for Every Chapter.", Inter, and the
  seven colours and six type styles in [the design brief](../design/m1-figma-brief.md).
- Splash: Warm White with a Charcoal wordmark and tagline. **Supersedes** the earlier apricot background
  with white text. Decorative apricot botanical leaves are chosen but **deferred** beyond Milestone 1.
- Log In: the existing Figma layout and labels (Username, Password, Forgot your password?, Log In), with
  the approved button and field styles.
- Milestone 1's acceptance criteria are unchanged.

**Flagged in the brief for decision (not silently changed):** the approved Log In label colour fails WCAG
2.2 AA (B1, 3.72:1); the approved field border fails non-text contrast (B2, 1.20:1); criterion 3's 390 pt
width and tolerance need agreeing against the 402 pt frame (B3); label placement and any heading on the
Log In screen (Q1, Q2); and "Username" versus email sign-in (decision 1), to revisit in Phase 2.

## 2026-10-17: Bounded biometric policy validity, and review of ADR 0028 decisions (decided)

**Decided by:** the founder. **Phase:** Phase 2 (B2). **Not** part of Milestone 1; nothing is implemented.

### Decisions

- **Approved:** most restrictive wins for users in several organizations (ADR 0028, A).
- **Approved:** device-native biometrics, including the documented limitation that the server cannot
  observe a local biometric check (ADR 0028, B).
- **Replaced:** the earlier "apply on next refresh" timing (ADR 0028, C) by a new security requirement.

### New security requirement

Biometric unlock must not rely indefinitely on stale organization permissions. Each device holds the
policy for a bounded validity period, and biometric unlock fails closed when the policy is expired or
cannot be verified. A supported non-biometric authentication path remains, and valid sessions are not
ended unnecessarily.

### Traceability

REQ-AUTH-031 to REQ-AUTH-033 added; REQ-AUTH-030 reworded. All Planned for Phase 2 (B2).

### Implementation decision requiring review

ADR 0028, "Policy validity and fail-closed behaviour", proposes the precise refresh and offline behaviour:
a per-user, per-device policy snapshot with a server-set 24-hour validity, refreshed on launch,
foreground, token refresh, 403 and sign-in; expiry measured by both the device clock and elapsed
monotonic time so the clock cannot be set back to extend it; and fail-closed behaviour that keeps the
session and the biometric enrolment. **It must be reviewed and approved before Phase 2 development
starts.** Open questions for that review: the validity period, whether agencies may shorten it, and the
non-biometric method for lifting the app lock (device passcode or a Kindred PIN).

## 2026-10-17: Organization policy for biometric unlock (decided)

**Decided by:** the founder, answering the open point in ADR 0028. **Phase:** Phase 2 (B2). **Not** part
of Milestone 1, and nothing is implemented now.

### Rules

1. Biometric unlock is optional for individual users and is never required to access Kindred.
2. Organization administrators may disable biometric unlock for their organization.
3. An organization-level prohibition overrides an individual user's preference.
4. When biometric unlock is disabled or unavailable, users keep a secure, supported non-biometric
   authentication method.
5. Device-native biometric authentication only; Kindred never collects or stores biometric templates.
6. Disabling biometrics invalidates the biometric unlock capability without unnecessarily ending
   otherwise valid sessions.

### Traceability

REQ-AUTH-020, REQ-AUTH-021 and REQ-AUTH-025 reworded; REQ-AUTH-026 to REQ-AUTH-030 added. All Planned for
Phase 2 (B2). Feature matrix: a row for the organization setting (`organization.manage`). Design: ADR 0028,
"Founder decision".

### How it fits the approved architecture

- **No new permission.** The setting sits in organization settings under the existing
  `organization.manage`, which the Organization Administrator already holds (Section 6). No role gains a
  permission.
- **Applied engineering decisions, flagged in ADR 0028 for confirmation:** for a user in several
  organizations the most restrictive setting applies (A); the server delivers the policy and the app
  enforces it, backed by device-integrity attestation, because a local biometric check cannot be
  observed by the server (B); a prohibition takes effect on the device's next access-context refresh (C).

## 2026-10-17: Optional biometric authentication for returning users (added)

**Requested by:** the founder. **Type:** new V1 requirement (authentication).
**Phase:** Phase 2, Identity, access and audit (backlog B2). **Not** part of Milestone 1.

### Requirement

- Support Face ID and Touch ID on iOS, and supported strong biometric authentication on Android.
- Offer biometric enrollment after a successful standard sign-in.
- Let returning users use biometrics to unlock an eligible authenticated session, or to securely access a
  protected reauthentication credential.
- Provide an accessible alternative sign-in method.
- Never store raw biometric data, passwords for biometric replay, or unprotected authentication tokens.
- Respect Cognito authentication, MFA, session expiration, server-side authorization, account revocation
  and device security requirements.
- Let users disable biometric access.
- Require appropriate reauthentication when device biometric enrollment changes or protected
  credentials are invalidated.

### Traceability

REQ-AUTH-017 to REQ-AUTH-025, all Planned for Phase 2 (B2); extended to REQ-AUTH-030 by the decision above. Design: ADR 0028.

### What it does not change

- Milestone 1's scope and its 15 acceptance criteria. The Milestone 1 Log In screen stays static.
- The approved authentication architecture (Section 6a, decision 4). Where the new requirement meets an
  approved rule, ADR 0028 lists the point and proposes keeping the approved rule. These need the
  founder's confirmation:
  1. Biometrics never extend the 30-day full sign-in.
  2. Biometric unlock does not satisfy step-up MFA.
  3. Biometric unlock continues a session that began with MFA, and never starts one.
  4. No biometric enrollment on a device that fails integrity attestation.
  5. Whether agencies may disable biometric unlock for their organization: **decided** (see the entry
     above).
  6. Passkeys are evaluated in Phase 2 as a server-verified alternative.
  7. The offline-draft lease stays separate from biometric session unlock.
  8. Biometrics may lift the 5-minute app lock.

### Design guidance for current Figma work

A returning-user screen may include a biometric sign-in option (for example "Use Face ID" with the
standard sign-in always visible as the alternative). The Milestone 1 Log In screen is not changed.
