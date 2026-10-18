# 0028. Optional biometric authentication for returning users

- Status: Proposed. The requirement and the organization-policy rules are decided by the founder
  (2026-10-17); the remaining technical design is decided in Phase 2 (backlog B2) and recorded as an
  update to this ADR.
- Date: 2026-10-17
- Source: founder requirement, 2026-10-17
  ([requirement-changes.md](../../product/requirement-changes.md), REQ-AUTH-017 to REQ-AUTH-030)

## Context

The founder added a V1 requirement after Phase 0 approval: returning users may optionally use Face ID or
Touch ID on iOS, or strong biometric authentication on Android, instead of signing in again. It must fit
the approved authentication and security architecture: Cognito with PKCE in the system browser, MFA for
staff, 15-minute access tokens with refresh rotation, a 5-minute app lock, a full sign-in at least every
30 days, tokens only in the Keychain or Keystore, server-side authorization on every request, and device
integrity attestation (Section 6a; Section 9; decisions 4, 99 and 104).

It is not built in Milestone 1, and Milestone 1's acceptance criteria are unchanged. The Milestone 1 Log
In screen stays static. Figma work may show a biometric option on the returning-user screen.

## How it fits the approved architecture

Device biometrics are a **local gate on a credential the device already holds**, not a new way to
authenticate to Kindred:

- After a normal Cognito sign-in with MFA, the user may opt in. The refresh token (the "protected
  reauthentication credential") is then stored as a Keychain or Keystore item that requires biometric
  user presence (iOS: access control bound to the current biometric set; Android: a `BIOMETRIC_STRONG`
  Class 3 key with user authentication required and invalidation on new enrollment).
- A successful biometric check only releases that item on the device. The app then refreshes with
  Cognito exactly as it would otherwise, so rotation, revocation, disabled accounts and session limits
  still apply. The API continues to check membership, permissions and device state on every request.
- Kindred never receives, stores or processes biometric data. No password is stored for replay, and no
  token is stored without hardware protection.
- The device passcode is never accepted as a substitute where biometric-only protection is configured.
  The accessible alternative is the standard sign-in, which is always available.

## Points the founder should confirm (flagged, not silently resolved)

These are where the new requirement meets an approved rule. The proposed handling keeps the approved
rule in each case; the founder may decide otherwise.

| # | Approved rule | Where it meets the new requirement | Proposed handling |
| --- | --- | --- | --- |
| 1 | Full sign-in at least every 30 days (decision 4) | Biometric unlock could keep a session alive indefinitely | Biometrics never extend the 30-day limit. After 30 days the user does a full sign-in with MFA, then biometrics work again. |
| 2 | Step-up MFA for `audit.read`, legal holds, support approval, export, originals and designations (Section 6) | A local biometric check is verified only by the device, not by Cognito | Biometric unlock does **not** satisfy step-up MFA. Those actions still need a fresh server-verified MFA. Only passkeys (see 6) could count, and only if a later ADR verifies them. |
| 3 | MFA for every staff sign-in (Section 6a) | Biometric unlock skips the MFA prompt | Allowed only within an existing session that began with a full MFA sign-in, never to start one. |
| 4 | Device integrity attestation (decisions 99 and 104) | A compromised device could expose the protected credential | Biometric enrollment is unavailable, and existing enrollment disabled, on a device marked Restricted, and on rooted or jailbroken devices where attestation confirms it. |
| 5 | Shared or agency-owned devices | Device biometrics accept **any** face or finger enrolled on the device, not specifically the Kindred user | **Decided 2026-10-17:** agencies have an organization setting to disable biometric unlock. See "Founder decision" below. |
| 6 | Passkeys preferred for MFA (Section 6a) | Passkeys also use Face ID or Touch ID, but are verified by the server | Design option for Phase 2: compare local biometric unlock (this ADR) with Cognito passkeys. A passkey is server-verified and phishing-resistant, so it could also serve as an MFA factor. Decided by ADR in Phase 2. |
| 7 | Offline drafts key: hardware-backed and protected by "device passcode or biometrics", plus a server lease (Section 4) | Two biometric-protected keys could become confused | Kept separate. Unlocking the session never extends or replaces the offline lease. |
| 8 | 5-minute app lock (decision 4) | The approved rule does not say how the lock is lifted | Biometrics, where enrolled, lift the app lock; otherwise the device passcode or a full sign-in, per the Phase 2 design. |

No conflict was found with the requirement that the API never sees passwords, with server-side
authorization, or with tokens carrying identity only.

## Founder decision: organization biometric policy (2026-10-17)

1. **Optional, never required.** Biometric unlock is an individual choice. No screen, workflow or policy
   may require it to access Kindred.
2. **Organization administrators may disable it** for their organization. The setting is part of
   organization settings, gated by the existing `organization.manage` permission (held by the
   Organization Administrator). No new permission is added, and no role gains one.
3. **An organization prohibition overrides the individual's preference.** A user's own opt-in has no
   effect while their organization disables biometric unlock.
4. **A secure non-biometric method always remains.** When biometric unlock is disabled or unavailable,
   the user continues with the supported non-biometric method: the standard Cognito sign-in with MFA,
   and the non-biometric way of lifting the app lock defined in the Phase 2 design.
5. **Device-native biometrics only.** Kindred uses the platform's Face ID, Touch ID or Android Class 3
   biometrics and never collects, receives or stores biometric templates or data.
6. **Disabling removes the capability, not the session.** When a user turns it off, or their
   organization does, the app removes the biometric gate: it deletes the biometric-bound copy of the
   reauthentication credential and keeps the session only through the ordinary hardware-protected
   secure storage (never an unprotected token). Otherwise valid sessions continue until their normal
   expiry. The next app-lock unlock or reauthentication uses the non-biometric method.
7. Recorded in this ADR, the requirement change log, the traceability file (REQ-AUTH-017 to
   REQ-AUTH-030) and the feature matrix.

### How the policy reaches the device

The organization setting travels in the user's server-side access context, which the app already
refreshes on foreground, after any 403 and on token refresh (Section 3). Changing the setting is audited
as an organization-settings change. The app applies a prohibition on its next access-context refresh.

### Points flagged for confirmation (engineering decisions applied, not silently)

| # | Point | Applied | Why |
| --- | --- | --- | --- |
| A | **A user who belongs to several organizations.** Biometric unlock opens the app session, which spans every organization the user can switch to, so it cannot be allowed for one organization and blocked for another. | **Most restrictive wins:** if any organization in which the user has an active membership disables biometric unlock, it is disabled for that user. | Follows rule 3: no organization's prohibition can be bypassed by a user's membership elsewhere. |
| B | **Enforcement limits.** A local biometric check happens only on the device, so the server cannot observe it. | The server delivers the policy and the app enforces it. A modified app that ignored the policy is covered by device-integrity attestation (decisions 99 and 104), which restricts modified apps. A later Cognito passkey design (point 6 above) would make the check server-verifiable. | Stated so the control is not overstated. |
| C | **Timing.** A prohibition applies on the device's next access-context refresh, not instantly on a phone that is offline. | Accepted, as for other client-side settings; server authorization is unaffected and still checked on every request. | Rule 6 asks to keep valid sessions; this avoids forcing sign-outs. |

## Verification before the design is frozen (Phase 2)

- Expo's biometric-protected secure storage on iOS and Android: whether it enforces Class 3
  (`BIOMETRIC_STRONG`) and invalidates on new enrollment, or whether a native module is needed (combine
  with spike S3, which already covers hardware-backed keys).
- Cognito behaviour: refresh-token validity versus the 30-day rule, revocation on sign-out and disable,
  and passkey support on the chosen Cognito tier.
- Accessibility: the biometric prompt and the always-available alternative sign-in meet WCAG 2.2 AA.
- Counsel (optional): confirm that device-native biometrics, where Kindred receives no biometric data,
  raise no state biometric-privacy obligations for agencies (related to Appendix D).

## Consequences

- REQ-AUTH-017 to REQ-AUTH-030 are Planned for Phase 2 (B2), with tests named in that phase.
- The Section 7 feature matrix gains a row for optional biometric unlock (self-service, subject to the
  organization policy) and the organization policy setting (`organization.manage`).
- Milestone 1 is unchanged.
