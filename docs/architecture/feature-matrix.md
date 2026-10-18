# Feature availability matrix (V1)

Seeded from Section 7 of the approved Phase 0 blueprint (approved October 17, 2026). This matrix is the
release gate (Section 7, release rule 1): it is updated every release, and
`scripts/dev/check-feature-matrix.mjs` checks it against the Section 6 catalog in
[permissions.json](permissions.json) on every pull request (release rule 2).

**Release status:** nothing below is released yet. Milestone 1 delivers only the static splash and Log In
screens, which are not product features. A row ships only when its permissions are seeded, its Section 5
navigation is defined, and its Appendix C scenarios pass (release rule 3).

## Legend

| Symbol | Meaning |
| --- | --- |
| ✅ | V1. Available to anyone with an active membership in that workspace |
| 🔒 | V1. Needs the Section 6 permission shown, within its scope (own, assigned or organization) |
| 🔑 | V1. Needs a designation or a named grant (Media Reviewer, Restricted Original Custodian, Export Custodian) |
| ➖ | Not offered in that workspace |
| ⏳ | Not yet released |

Caregiver Mobile and Employer Mobile are the two workspaces in the app (Employer is the Organization
Administrator workspace). A person who holds both base roles sees both. Future web columns are not part of
V1. A row with no permission needs only an active membership.

## Feature availability (V1)

<!-- feature-matrix:start -->
| Feature | Caregiver Mobile | Employer Mobile | Future Caregiver Web | Future Employer Web | Section 6 permission |
| --- | --- | --- | --- | --- | --- |
| Sign-in, MFA, workspace switch | ✅ | ✅ | ⏳ | ⏳ | None |
| Optional biometric unlock for returning users, never required; unavailable where the organization disables it (added 2026-10-17; ADR 0028) | ✅ | ✅ | ⏳ | ⏳ | None |
| Organization setting to disable biometric unlock (added 2026-10-17; ADR 0028) | ➖ | 🔒 | ⏳ | ⏳ | `organization.manage` |
| Own profile, notifications, registered devices | ✅ | ✅ | ⏳ | ⏳ | None |
| Client directory and profile | 🔒 (assigned) | 🔒 (all) | ⏳ | ⏳ | `clients.read`, `clients.read.all` |
| Clinical details and care alerts (read) | 🔒 | 🔒 | ⏳ | ⏳ | `clients.clinical.read`, `clients.alerts.read` |
| Add, edit and archive clients; manage alerts | ➖ | 🔒 | ⏳ | ⏳ | `clients.create`, `clients.update`, `clients.archive`, `clients.alerts.manage` |
| Caregiver directory, invitations, staff access and devices | ➖ | 🔒 | ⏳ | ⏳ | `caregivers.read`, `caregivers.manage`, `memberships.manage` |
| Assignments and documentation grace revocation | ➖ | 🔒 | ⏳ | ⏳ | `assignments.manage`, `assignments.grace.revoke` |
| Schedule view | ✅ (own) | 🔒 (all) | ⏳ | ⏳ | `schedules.read`, `shifts.read.all` |
| Create and manage shifts | ➖ | 🔒 | ⏳ | ⏳ | `schedules.manage` |
| Start and end shift | 🔒 | ➖ (🔒 if also a caregiver) | ⏳ | ⏳ | `shifts.start`, `shifts.end` |
| Missed punches, time corrections, shift exceptions | ➖ | 🔒 | ⏳ | ⏳ | `shifts.adjust` |
| Own hours and shift history | 🔒 | ➖ (🔒 if also a caregiver) | ⏳ | ⏳ | `timesheets.read.own` |
| Timesheet review | ➖ | 🔒 | ⏳ | ⏳ | `timesheets.review` |
| Care notes: draft, publish, edit own, attach cleared media | 🔒 | ➖ (🔒 if also a caregiver) | ⏳ | ⏳ | `notes.create`, `notes.publish`, `notes.edit` |
| Read notes and version history | 🔒 (assigned) | 🔒 (all) | ⏳ | ⏳ | `notes.read`, `notes.read.all`, `notes.history.read` |
| Report a note entered in error | 🔒 | ➖ | ⏳ | ⏳ | `notes.corrections.report` |
| Notes oversight: outstanding drafts, correction cases, exceptions | ➖ | 🔒 | ⏳ | ⏳ | `notes.drafts.indicator.read`, `notes.drafts.disposition.manage`, `notes.corrections.manage`, `documentation.exceptions.approve` |
| Moments timeline and Home preview | 🔒 (assigned) | 🔒 (all) | ⏳ | ⏳ | `moments.read`, `moments.read.all` |
| Photo and video capture or library import, crop and blur, audio control | 🔒 | ➖ (🔒 if also a caregiver) | ⏳ | ⏳ | `moments.create` |
| Offline drafts, capture and queued actions (local work only; nothing is authorized offline) | ✅ | ➖ | ⏳ | ⏳ | Same permission as the online action; every queued action is checked again at synchronization |
| Media download (servable version only) | ➖ | 🔒 | ⏳ | ⏳ | `media.download` |
| Media clearance queue | 🔑 | 🔑 | ⏳ | ⏳ | `media.consent.review` |
| Disposition of escalated or orphaned held media | ➖ | 🔒 | ⏳ | ⏳ | `media.disposition.manage` |
| Restricted originals | 🔑 | 🔑 | ⏳ | ⏳ | `media.originals.read` |
| Media Consent Dashboard | 🔒 (coverage and issues for own media, capture, withdrawal) | 🔒 (full dashboard and policy) | ⏳ | ⏳ | `consents.read`, `consents.manage`, `consents.verify`, `consents.withdraw`, `consents.capture`, `consents.policy.manage` |
| Remote consent link (public page for people without an account) | 🔒 (issue for people in own media) | 🔒 (issue, revoke, review) | ⏳ | ⏳ | `consents.capture`, `consents.manage` |
| Representatives and their authority | ➖ | 🔒 | ⏳ | ⏳ | `authorities.manage`, `authorities.verify` |
| Rights requests | ➖ | 🔒 | ⏳ | ⏳ | `rights_requests.manage`, `rights_requests.fulfill` |
| Evidence packages and external reviewer access | ➖ | 🔒 | ⏳ | ⏳ | `evidence.package.create`, `evidence.reviewers.manage` |
| Support access approvals | ➖ | 🔒 | ⏳ | ⏳ | `support_access.approve` |
| Documents | 🔒 (read, assigned) | 🔒 (read all, upload, manage) | ⏳ | ⏳ | `documents.read`, `documents.read.all`, `documents.upload`, `documents.manage` |
| Reports and exports | ➖ | 🔒 | ⏳ | ⏳ | `reports.read`, `reports.export` |
| Audit trail | ➖ | 🔒 | ⏳ | ⏳ | `audit.read` |
| Organization settings, roles and designations | ➖ | 🔒 | ⏳ | ⏳ | `organization.manage`, `roles.manage`, `designations.assign` |
| Legal holds | ➖ | 🔒 | ⏳ | ⏳ | `retention.holds.manage` |
| Offboarding status and comprehensive export | ➖ | 🔒 (status), 🔑 (export) | ⏳ | ⏳ | `organization.manage`, `organization.export` |
| Kindu (Coming Soon screen only, no AI features) | 🔒 | 🔒 | ⏳ | ⏳ | `kindu.use` |
| Kindu AI features (briefings, summaries, suggestions, conversation) | ⏳ V1.2 (tentative) | ⏳ V1.2 (tentative) | ⏳ | ⏳ | Not defined |
| Family and Client access | ⏳ | ⏳ | ⏳ | ⏳ | Reserved: `moments.share`, `family_access.manage` |
| Family legacy archive (cross-agency) | ⏳ | ⏳ | ⏳ | ⏳ | Not defined |
<!-- feature-matrix:end -->

## Limited V1 workspaces and public pages

These identities have no tabs and no organization role (Section 6). They are part of V1.

| Surface | Who uses it | What it offers | Availability |
| --- | --- | --- | --- |
| Reviewer-only workspace | An outside Media Reviewer or a designated reviewer with no other role | Files waiting for review, the review screen and nothing else | V1, in the app, with MFA |
| Requester workspace | A person with a rights request | Their own requests, responses and downloads | V1, in the app, with MFA |
| External reviewer workspace | A named outside reviewer | A read-only timeline for the granted clients, dates and content types, and package downloads | V1, in the app, with MFA |
| Export workspace | An Export Custodian during an offboarding window | The offboarding destination only | V1, in the app, with MFA and step-up |
| Remote consent page | A signer without an account | One link: review, sign, renew or withdraw | V1, public web page outside the app |
| Kindred platform operations | Kindred staff | Provisioning, support requests, disposal approval, security approval | Internal tooling, not part of the product |

## Release rules (Section 7)

1. The matrix is the release gate. V1 ships with the full approved mobile functionality; web is future
   and is released only when it offers equivalent authorized functionality.
2. Every row is testable: the build fails if a V1 permission appears on no row, if a row names a
   permission that does not exist, or if a cell offers a feature to a role that does not hold its
   permission.
3. A row ships only when its permissions are seeded, its Section 5 navigation is defined, and its
   Appendix C scenarios pass.
4. Feature flags never grant access. Server-side flags keep unreleased rows off; every request is still
   checked against permission, scope, consent and record state.
5. Hidden is not secured. The server enforces the same rule on every request.
6. Deferred rows stay deferred. Family and Client access has its data model only, and the Kindu AI
   features need the Section 2 safeguards before any release.
