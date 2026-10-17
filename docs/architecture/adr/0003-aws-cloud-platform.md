# 0003. AWS as the cloud platform

- Status: Accepted (no AWS resources exist yet; see ADR 0026)
- Date: 2026-10-17
- Source: Section 2 "Cloud and identity" (decided October 15, 2026), portability rules, AWS account
  boundaries; decisions 108, 116 and 118

## Context

Kindred will hold health information for agencies and needs HIPAA-eligible services under a BAA.

## Decision

AWS: Amazon Cognito, RDS for PostgreSQL, S3, ECS Fargate, KMS. Azure was evaluated and remains the
fallback. Portability rules apply from day one: containers configured by environment variables, plain
PostgreSQL (no Aurora-only features), standard OIDC in the system browser (no Amplify SDK), storage,
secrets, email and push behind interfaces, our own audit trail, no Lambda or SQS orchestration in V1,
Terraform for infrastructure, VPC endpoints and billing alerts. The four-account structure (management,
production, security and log archive, non-production) is the proposed design and is set up at the start
of Phase 2 under the founder's separate authorization.

## Consequences

- The AWS BAA must be accepted before any real client data is processed, and service-specific
  verification happens before each service is used with real data (decision 118).
- Milestone 1 creates no AWS resources and the development scripts refuse to run with AWS credentials
  for an unlisted account (ADR 0024).
