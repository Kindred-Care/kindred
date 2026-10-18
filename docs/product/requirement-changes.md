# Requirement changes after Phase 0 approval

The Phase 0 blueprint (`Kindred_Phase0_Final_Closed_rev355`, approved 2026-10-17) is the baseline.
Requirements the founder adds or changes afterwards are logged here, newest first, with their IDs in
[traceability.md](traceability.md). Each entry says what changed, why, which approved rules it touches,
and what it does not change.

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

REQ-AUTH-017 to REQ-AUTH-025, all Planned for Phase 2 (B2). Design: ADR 0028.

### What it does not change

- Milestone 1's scope and its 15 acceptance criteria. The Milestone 1 Log In screen stays static.
- The approved authentication architecture (Section 6a, decision 4). Where the new requirement meets an
  approved rule, ADR 0028 lists the point and proposes keeping the approved rule. These need the
  founder's confirmation:
  1. Biometrics never extend the 30-day full sign-in.
  2. Biometric unlock does not satisfy step-up MFA.
  3. Biometric unlock continues a session that began with MFA, and never starts one.
  4. No biometric enrollment on a device that fails integrity attestation.
  5. **Decision needed:** whether agencies may disable biometric unlock for their organization, because
     device biometrics accept anyone enrolled on a shared device.
  6. Passkeys are evaluated in Phase 2 as a server-verified alternative.
  7. The offline-draft lease stays separate from biometric session unlock.
  8. Biometrics may lift the 5-minute app lock.

### Design guidance for current Figma work

A returning-user screen may include a biometric sign-in option (for example "Use Face ID" with the
standard sign-in always visible as the alternative). The Milestone 1 Log In screen is not changed.
