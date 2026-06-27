# Launch Settings Evidence Log

Date: 2026-06-19

This document records production launch settings for AskSafe Home without
copying secret values into the repository.

Use this log to prove the team checked the operational settings that matter for
judging and early production use.

## Recording Rules

- Record setting names, status, and where the setting lives.
- Do not record secret values.
- Do not paste access keys, one-time codes, passwords, or private contact
  details into this document.
- If a setting needs evidence, record a screenshot filename or dashboard path,
  not a secret value.
- If a setting is unknown, mark it as `Needs confirmation` instead of guessing.

## Production Deployment

| Setting | Current record | Status |
| --- | --- | --- |
| Production URL | `https://asksafe-home.vercel.app` | Confirmed |
| Vercel project | `asksafe-home` | Confirmed |
| Production branch | `main` | Confirmed |
| GitHub repository | `sailing-together/asksafe-home` | Confirmed |
| Automatic production deploys | Merges to `main` deploy through Vercel | Confirmed |
| Rollback path | Vercel Instant Rollback and GitHub revert are documented | Confirmed |

## Vercel Runtime Environment Variables

These names may be present in Vercel production environment variables. Record
names only.

| Variable name | Purpose | Sensitivity | Status |
| --- | --- | --- | --- |
| `AWS_REGION` | AWS runtime region | Non-secret | Confirmed |
| `AWS_ACCESS_KEY_ID` | Temporary scoped runtime AWS key id | Sensitive operational credential | Needs final dashboard confirmation |
| `AWS_SECRET_ACCESS_KEY` | Temporary scoped runtime AWS secret | Secret | Needs final dashboard confirmation |
| `ASKSAFE_EVENTS_TABLE` | DynamoDB safety events table | Non-secret | Confirmed |
| `ASKSAFE_FEEDBACK_TABLE` | DynamoDB feedback table | Non-secret | Confirmed |
| `ASKSAFE_SUPPORT_EVENTS_TABLE` | DynamoDB support events table | Non-secret | Confirmed |
| `ASKSAFE_USERS_TABLE` | DynamoDB users table | Non-secret | Confirmed |
| `ASKSAFE_HOUSEHOLDS_TABLE` | DynamoDB households table | Non-secret | Confirmed |
| `ENABLE_BEDROCK_EXPLANATION` | Optional Bedrock explanation assist flag | Non-secret | Enabled for production smoke |
| `BEDROCK_MODEL_ID` | Optional Bedrock model id | Non-secret | Confirmed with AU inference profile |
| `BEDROCK_MAX_INPUT_CHARS` | Optional Bedrock input bound | Non-secret | Confirmed |
| `BEDROCK_MAX_OUTPUT_TOKENS` | Optional Bedrock output-token bound | Non-secret | Confirmed |
| `BEDROCK_TIMEOUT_MS` | Optional Bedrock server timeout | Non-secret | Confirmed |
| `ANALYZE_MAX_MESSAGE_CHARS` | Optional analyze message length cap | Non-secret | Optional; defaults to 1800 |
| `ENABLE_BEDROCK_QUOTA` | Enables runtime Bedrock quota hard stop | Non-secret | Recommended `true` for production |
| `BEDROCK_GLOBAL_DAILY_CALL_LIMIT` | Global daily Bedrock call cap | Non-secret | Recommended conservative value |
| `BEDROCK_GLOBAL_MONTHLY_CALL_LIMIT` | Global monthly Bedrock call cap | Non-secret | Recommended conservative value |
| `BEDROCK_ANONYMOUS_DAILY_CALL_LIMIT` | Anonymous daily Bedrock call cap | Non-secret | Recommended low value |
| `BEDROCK_REGISTERED_DAILY_CALL_LIMIT` | Setup/signed-in daily Bedrock call cap | Non-secret | Recommended moderate value |

Current competition boundary:

- Vercel uses scoped AWS runtime credentials for DynamoDB event writes.
- The runtime key should be rotated or deleted after the competition.
- Bedrock explanation assist is enabled through a bounded, fallback-safe path.
- Bedrock quota hard stop should be enabled before public sharing so quota exhaustion falls back to deterministic rules instead of continuing model calls.

## GitHub Repository And Environment Variables

These are used by the Terraform workflow and should not be confused with Vercel
runtime environment variables.

| Name | Type | Status |
| --- | --- | --- |
| `AWS_REGION` | Repository variable | Confirmed |
| `TF_STATE_BUCKET` | Repository variable | Confirmed |
| `TF_STATE_KEY` | Repository variable | Confirmed |
| `TF_LOCK_TABLE` | Repository variable | Confirmed |
| `TF_PROJECT_NAME` | Repository variable | Confirmed |
| `TF_ENVIRONMENT` | Repository variable | Confirmed |
| `TF_BEDROCK_MODEL_ARNS` | Repository variable | Confirmed |
| `AWS_GITHUB_ACTIONS_ROLE_ARN` | Repository secret | Confirmed |
| `aws-infra` | GitHub environment | Confirmed |

## AWS Cost And Budget Controls

| Setting | Current record | Status |
| --- | --- | --- |
| AWS account | `AskSafe Home` | Confirmed |
| AWS account id | `893794041695` | Confirmed |
| AWS region | `ap-southeast-2` | Confirmed |
| DynamoDB billing mode | Pay-per-request through Terraform | Confirmed |
| Bedrock inference profile | `au.anthropic.claude-haiku-4-5-20251001-v1:0` | Production smoke passed |
| Bedrock runtime policy allowlist | Terraform variable `TF_BEDROCK_MODEL_ARNS` | Confirmed |
| Bedrock usage | Bounded explanation assist only, with deterministic fallback | Confirmed; production smoke rechecked 2026-06-25 |
| AWS budget alert | Dashboard evidence not recorded here yet | Needs confirmation |

## Vercel Plan And Cost Controls

| Setting | Current record | Status |
| --- | --- | --- |
| Vercel project owner/team | Needs dashboard confirmation | Needs confirmation |
| Vercel active plan | Needs dashboard confirmation | Needs confirmation |
| Vercel spend alert | Dashboard evidence not recorded here yet | Needs confirmation |
| Vercel Speed Insights | Dashboard evidence not recorded here yet | Needs confirmation |
| Vercel Observability Plus | Dashboard evidence not recorded here yet | Needs confirmation |
| Vercel Fluid Compute | Dashboard evidence not recorded here yet | Needs confirmation |

## Deployment Protection And Security Dashboard Settings

| Setting | Current record | Status |
| --- | --- | --- |
| Production access | Public for judging | Confirmed |
| Preview deployment protection | Dashboard evidence not recorded here yet | Needs confirmation |
| Vercel WAF | Dashboard evidence not recorded here yet | Needs confirmation |
| Log Drains | Dashboard evidence not recorded here yet | Needs confirmation |
| Team access roles | Dashboard evidence not recorded here yet | Needs confirmation |

## Code-Level Launch Controls

| Control | Evidence | Status |
| --- | --- | --- |
| Incident and rollback runbook | `docs/operations/incident-response-and-rollback-runbook.md` | Confirmed |
| Production smoke tests | `docs/operations/production-smoke-tests.md` | Confirmed |
| Security headers | `next.config.mjs` and `next.config.test.mjs` | Confirmed |
| CSP | Report-only in `next.config.mjs` | Confirmed, enforce later |
| Event API rate limiting | `lib/server/rate-limit.ts` | Competition baseline |
| TypeScript build errors | `next.config.mjs` no longer ignores build errors | Confirmed |
| Image optimization | `images.unoptimized=true` is documented and tested | Revisit after asset cleanup |

## Final Pre-Judging Checklist

- [ ] Confirm Vercel spend alert state.
- [ ] Confirm AWS budget alert state.
- [ ] Confirm Vercel production env vars are scoped to production only where
      appropriate.
- [ ] Confirm Vercel secret values are marked sensitive.
- [ ] Confirm preview deployment protection decision.
- [ ] Confirm team access roles.
- [ ] Run production smoke tests after the next production deploy.
