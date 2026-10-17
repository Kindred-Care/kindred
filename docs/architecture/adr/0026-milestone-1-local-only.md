# 0026. Milestone 1 is local only

- Status: Accepted
- Date: 2026-10-17
- Source: Section 10 purpose and boundaries, out-of-scope list; decisions 108, 111, 112, 115 and 116

## Decision

Milestone 1 uses no AWS resources, no real data and no new paid services. The only outside services are
GitHub (the founder's GitHub Team organization), and, for criterion 15, an Expo (EAS) account and the
Apple Developer Program in the founder's name. There is no Cognito, no sign-in, no memberships, roles or
permissions beyond default deny, no feature screens, no storage or media pipeline, no push
notifications, no vendor or AI integration and no web app.

## Consequences

- RDS-specific checks are recorded from AWS documentation and repeated against RDS in Phase 2.
- A blocked criterion is reported as Blocked with its named blocker, never as Passed. Milestone 1 is not
  fully accepted until criterion 15 passes on both devices or the founder authorizes an exception.
