# Requirement changes after Phase 0 approval

The Phase 0 blueprint (`Kindred_Phase0_Final_Closed_rev355`, approved 2026-10-17) is the baseline.
Requirements the founder adds or changes afterwards are logged here, newest first, with their IDs in
[traceability.md](traceability.md). Each entry says what changed, why, which approved rules it touches,
and what it does not change.

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
