# Appendix G decision log map

Appendix G of the approved blueprint logs the engineering decisions made under the October 16, 2026
decision-making rules. This file maps each one to where it is recorded in the repository: an ADR for
architecture, security and tooling decisions, or a requirement row in
[traceability.md](../../product/traceability.md) for product behaviour that later phases implement and
test. The summaries are short paraphrases; the blueprint text is authoritative.

| # | Decision (summary) | Recorded in |
| --- | --- | --- |
| 1 | Sign in with an email address as the Cognito username | ADR 0004; REQ-AUTH-001 |
| 2 | Follow Brand Foundation product language | REQ-NAV-014 |
| 3 | Invitations expire after 7 days and work once | REQ-ID-004 |
| 4 | 15-minute tokens, refresh rotation, 5-minute app lock, sign-in every 30 days | ADR 0004; REQ-AUTH-003 |
| 5 | Overlapping shifts allowed with a warning; one shift in progress per caregiver | REQ-SHIFT-003 |
| 6 | Late after 15 minutes, Missed at scheduled end | REQ-SHIFT-004 |
| 7 | Late-received or clock-skewed shift events flagged for review | REQ-SHIFT-005 |
| 8 | Assignments end on suspension or deactivation; one-click restore | REQ-CLI-010 |
| 9 | Documentation grace measured from the assignment's effective end | REQ-NOTE-007 |
| 10 | Care alerts reviewed every 90 days, at most 280 characters | REQ-CLI-005 |
| 11 | A shift is documented when a note is published within 24 hours | REQ-RPT-003 |
| 12 | Entries documented more than 24 hours late are flagged | REQ-NOTE-016 |
| 13 | Timeline ordered by care-occurred time, newest first | REQ-MOM-004 |
| 14 | A written note publishes while media is pending | REQ-PO-045 |
| 15 | Removed note media stays visible in history unless clearance forbids it | REQ-MOM-008 |
| 16 | Library imports allowed with the capture safeguards | REQ-PO-043 |
| 17 | Download only for staff with media.download and evidence packages | REQ-MED-010 |
| 18 | Blurring defaults to the whole person; face-only selectable | REQ-MED-005 |
| 19 | Re-rendering is unlimited | REQ-MED-006 |
| 20 | Administrators hold media review by default | Superseded by the Section 6 matrix: administrators do not receive the Media Reviewer designation (founder decision 2026-10-17, ADR 0027) |
| 21 | Nothing prompts before capture | REQ-MED-001 |
| 22 | Expiring Soon is 30 days; reminders at 30 and 7 days | REQ-CONS-006 |
| 23 | Verbal or phone consent gets a second review unless policy accepts it | REQ-CONS-004 |
| 24 | Authorizations cannot exceed 12 months in V1 | REQ-CONS-002 |
| 25 | One-tap publish after clearance; policy may enable auto-publish | REQ-MED-013 |
| 26 | Renewal reminders start with agency staff | REQ-CONS-007 |
| 27 | Remote links: single-purpose, 72 hours, one-time code, limited auto-verify | REQ-PO-044 |
| 28 | Filter for recently auto-verified consents, no mandatory sampling | REQ-CONS-008 |
| 29 | Staff and caregivers can add people records | REQ-CONS-009 |
| 30 | Offline: 7-day lease, locked drafts kept 30 days, logout default Sync now | REQ-OFF-003 |
| 31 | Media tokens 5 minutes, export links 24 hours, incomplete uploads 24 hours | REQ-FILE-006 |
| 32 | Video through short-lived signed requests to servable variants | REQ-FILE-007 |
| 33 | Restore drills before launch and every six months | REQ-OPS-002 |
| 34 | Emergency access criteria, 30-minute expiry, review within 24 hours | REQ-SUP-004 |
| 35 | PostgreSQL: latest RDS major, 16 or later | ADR 0019; REQ-DATA-007 |
| 36 | RLS covers organization and draft author; assignment scope in the application | ADR 0005; REQ-DB-005 |
| 37 | Platform-support tables ship at launch | REQ-SUP-001 |
| 38 | No sealed holding area for recovered drafts | REQ-OFF-006 |
| 39 | Originals stay restricted and are disposed of when counsel allows | REQ-MED-012 |
| 40 | Recovery targets for component and zone failures; Region-wide waits | REQ-OPS-001 |
| 41 | Evidence packages plus a minimal read-only reviewer view | REQ-EVD-001, REQ-EVD-002 |
| 42 | Build priority order stands; media benchmark as an early spike | Section 8 phases (traceability Phase column) |
| 43 | Accessibility standard is WCAG 2.2 AA | ADR 0022; REQ-SECC-012 |
| 44 | Imported media records source; device dates unverified | REQ-PO-043 |
| 45 | Pending note media joins only through a new version | REQ-PO-045 |
| 46 | Consent links 72 hours (7 days max), 6-digit code for 10 minutes, 5 attempts | REQ-PO-044 |
| 47 | Remote renewal never widens scope; withdrawal effective at once | REQ-ACC-L7, REQ-ACC-L8 |
| 48 | Home Recent Moments: limited preview, 10 items, 7 days | REQ-NAV-008 |
| 49 | Two labelled add buttons on the timeline, hidden without permission | REQ-NAV-007 |
| 50 | Client picker order, search above eight, Switch client | REQ-NAV-005 |
| 51 | Timeline shows only published and cleared items; In progress strip | REQ-NAV-006 |
| 52 | Seven plain media labels for caregivers | REQ-NAV-009 |
| 53 | Organization Home: at most five Needs attention cards; six More groups | REQ-NAV-010, REQ-NAV-011 |
| 54 | Notes oversight replaces the Care Notes review destination | REQ-NAV-012 |
| 55 | Caregivers reach consent only inside the media flow and profile overflow | REQ-NAV-013 |
| 56 | Limited workspaces without tabs; public remote signing page | REQ-NAV-015 |
| 57 | Scope expressed in the permission name (.all = organization-wide) | REQ-PERM-002 |
| 58 | Three predefined designations | REQ-PERM-003 |
| 59 | audit.read for administrators with step-up MFA, every read audited | REQ-PERM-006 |
| 60 | moments.manage retired; moments.share reserved | REQ-PERM-001 |
| 61 | organization.export only for Export Custodians in an open window | REQ-PERM-007 |
| 62 | Caregivers read documents for assigned clients only | REQ-PERM-001 |
| 63 | Designations need designations.assign, step-up MFA, audit and notice | REQ-PERM-004 |
| 64 | No self-approval; separation rules follow the person | REQ-PERM-005 |
| 65 | Authorization test matrix generated from the catalog | ADR 0027; REQ-AUTH-014 |
| 66 | "N waiting" chip shown to the author only | REQ-NAV-006 |
| 67 | Explicit permission-by-role matrix | ADR 0027; REQ-PERM-001 |
| 68 | No impersonation for any role | REQ-AUTH-012 |
| 69 | Designations use designations.assign | REQ-PERM-004 |
| 70 | Added authority, consent, rights and support permissions | REQ-PERM-001 |
| 71 | Added shifts.adjust; removal during a shift | REQ-SHIFT-006 |
| 72 | Added disposition permissions that never read content | REQ-PERM-001 |
| 73 | Added retention.holds.manage and documents.read.all; step-up MFA list | REQ-PERM-006 |
| 74 | Narrow capabilities for requester, reviewer, signer and support grantee | REQ-PERM-008 |
| 75 | Setup asks for a Media Reviewer; solo self-assignment limits | REQ-PERM-009 |
| 76 | Lifecycle rules and Appendix C T1 to T16 | REQ-AUTH-015; REQ-ACC-T1 to T16 |
| 77 | Solo-agency export process | REQ-PERM-009; REQ-ACC-T17 to T19 |
| 78 | Solo-agency media review | REQ-PERM-009; REQ-ACC-T20, T21 |
| 79 | Designations need designations.assign (corrected entry) | REQ-PERM-004 |
| 80 | Keep held is time-limited and re-escalates | REQ-ACC-T23 |
| 81 | Outside Media Reviewer obligations go to counsel | Appendix D (counsel) |
| 82 | Feature matrix permission column, build check and release rules | ADR 0027; REQ-FM-001 to REQ-FM-006 |
| 83 | Matrix symbols; administrators show no authoring cells | [feature-matrix.md](../feature-matrix.md) |
| 84 | Feature flags never grant access | REQ-FM-004 |
| 85 | Limited workspaces listed separately | [feature-matrix.md](../feature-matrix.md) |
| 86 | Web release rule: V1 ships with full mobile functionality | REQ-FM-001 |
| 87 | Kindu row gated by kindu.use | ADR 0008; REQ-KINDU-001 |
| 88 | Offline use grants no access; queued actions rechecked | REQ-OFF-002 |
| 89 | Eleven phases | Section 8 (traceability Phase column) |
| 90 | Four gates G1 to G4 | REQ-GATE-001 to REQ-GATE-004 |
| 91 | Eight early verification spikes | REQ-SPIKE-001 to REQ-SPIKE-008 |
| 92 | Policy-dependent behaviour ships as versioned settings | REQ-SECC-011 |
| 93 | Every backlog epic names permissions or tests | Traceability Phase column |
| 94 | Legal and policy release gate | REQ-SECC-010 |
| 95 | Phase 7a depends on B2 to B5; synthetic data until G2 | REQ-GATE-002 |
| 96 | Notifications use inherited authorization | REQ-NOTIF-004 |
| 97 | A failed spike needs a documented alternative | ADR 0001 |
| 98 | Claims policy: no compliance claims on technical controls alone | REQ-SECC-001 |
| 99 | Mobile posture: screenshot handling, attestation, no pinning | REQ-SECC-004 to REQ-SECC-006 |
| 100 | No error monitoring or analytics receives client data | ADR 0021; REQ-SECC-007 |
| 101 | Incident plan before real data; alarms | REQ-SECC-008 |
| 102 | Legal and compliance release matrix | REQ-SECC-010 |
| 103 | Penetration test scope; dependency inventory per release | ADR 0018; REQ-SECC-009 |
| 104 | Device integrity has three outcomes | REQ-SECC-005 |
| 105 | Device state is a record-state condition in the access evaluator | REQ-SECC-005 |
| 106 | Vendor verification applies to selected services only | REQ-SECC-003 |
| 107 | Push payloads carry an opaque token and generic text | REQ-NOTIF-001 |
| 108 | Milestone 1 is local only | ADR 0026 |
| 109 | Protections, default deny, log redaction, roles and seed in Milestone 1 | ADRs 0016, 0019, 0020, 0021, 0024 |
| 110 | Physical-device development build in acceptance | ADR 0013; REQ-MOB-004 |
| 111 | EAS account in the founder's name | ADR 0026 |
| 112 | Criterion 15 passes only when both devices are verified | ADR 0026 |
| 113 | Placeholder tokens allowed if flagged; criterion 3 Provisional | ADR 0022 |
| 114 | gitleaks is supplementary; criteria 8 and 9 Blocked until enforced | ADRs 0016, 0017 |
| 115 | Section 11 reorganization | Section 11 (no repository artifact) |
| 116 | Founder confirms before real media after G2; no account provisioning | ADR 0026; REQ-GATE-002 |
| 117 | Lead-time items started early | Section 11 (no repository artifact) |
| 118 | AWS BAA before real data; service checks before each service | ADR 0003; REQ-SECC-003 |
| 119 | Phase 0 closed; Milestone 1 needs separate authorization | Authorized by the founder on 2026-10-17 |
