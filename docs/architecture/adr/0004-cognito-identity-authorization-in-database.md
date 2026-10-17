# 0004. Cognito for identity, authorization in our database

- Status: Accepted (implemented in Phase 2)
- Date: 2026-10-17
- Source: Section 1 stack concerns, Section 2 key decisions, Section 6a Authentication and
  Authorization; decisions 1 and 4

## Context

Users can belong to several organizations and switch workspaces without signing in again. Permissions
must change on the next request when a membership, role or assignment changes.

## Decision

- Amazon Cognito with the OIDC authorization code flow and PKCE in the system browser. The app and API
  never see passwords. Sign-in is by email address (decision 1).
- MFA for every staff account; authenticator apps or passkeys preferred over SMS.
- 15-minute access tokens with refresh rotation, a 5-minute app lock and a full sign-in at least every
  30 days (decision 4). Tokens only in the iOS Keychain or Android Keystore.
- Tokens carry identity only. Memberships, roles, permissions and grants live in our database and are
  checked on every request, through one access evaluator.
- The API validates signature, issuer, audience, expiry and token type on every call.
- `UserIdentities (issuer, subject)` links a Cognito account to a Kindred user, never by email match.

## Consequences

- Milestone 1 has no sign-in: a placeholder authentication scheme authenticates nobody (ADR 0020).
- Region-wide recovery depends on Cognito multi-Region behaviour with TOTP MFA, still to verify (S8).
