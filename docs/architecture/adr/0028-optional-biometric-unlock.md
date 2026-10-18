# 0028. Optional biometric authentication for returning users

- Status: Proposed. The requirement is approved by the founder (2026-10-17); the design is decided in
  Phase 2 (backlog B2) and recorded as an update to this ADR.
- Date: 2026-10-17
- Source: founder requirement, 2026-10-17
  ([requirement-changes.md](../../product/requirement-changes.md), REQ-AUTH-017 to REQ-AUTH-025)

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
| 5 | Shared or agency-owned devices | Device biometrics accept **any** face or finger enrolled on the device, not specifically the Kindred user | **Founder decision needed:** whether agencies can turn biometric unlock off for their organization (an organization setting). Proposed default: allowed, with an agency policy switch to disable it. |
| 6 | Passkeys preferred for MFA (Section 6a) | Passkeys also use Face ID or Touch ID, but are verified by the server | Design option for Phase 2: compare local biometric unlock (this ADR) with Cognito passkeys. A passkey is server-verified and phishing-resistant, so it could also serve as an MFA factor. Decided by ADR in Phase 2. |
| 7 | Offline drafts key: hardware-backed and protected by "device passcode or biometrics", plus a server lease (Section 4) | Two biometric-protected keys could become confused | Kept separate. Unlocking the session never extends or replaces the offline lease. |
| 8 | 5-minute app lock (decision 4) | The approved rule does not say how the lock is lifted | Biometrics, where enrolled, lift the app lock; otherwise the device passcode or a full sign-in, per the Phase 2 design. |

No conflict was found with the requirement that the API never sees passwords, with server-side
authorization, or with tokens carrying identity only.

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

- REQ-AUTH-017 to REQ-AUTH-025 are Planned for Phase 2 (B2), with tests named in that phase.
- The Section 7 feature matrix gains a row for optional biometric unlock (no permission; self-service).
- Milestone 1 is unchanged.
