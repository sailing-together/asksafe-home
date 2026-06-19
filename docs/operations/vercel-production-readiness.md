# Vercel Production Readiness Review

Date: 2026-06-19

Source checklist: [Vercel Production Checklist](https://vercel.com/docs/production-checklist)

## Purpose

This document adapts Vercel's production launch checklist to AskSafe Home.

AskSafe Home is a senior-safety decision workflow, so production readiness should focus on:

- keeping the safety flow available
- preventing accidental exposure of sensitive data
- keeping AWS and Bedrock costs bounded
- making rollback and incident response simple
- avoiding enterprise-only work that does not reduce uncertainty for seniors before judging

## Current Project Assumptions

- Vercel project: `asksafe-home`
- Production URL: `https://asksafe-home.vercel.app`
- Framework: Next.js App Router
- Deployment source: GitHub `main`
- Backend: Next.js route handlers on Vercel
- AWS data store: DynamoDB in `ap-southeast-2`
- Bedrock: designed and runtime-scaffolded, but not enabled
- Current competition runtime path: Vercel uses scoped AWS runtime credentials stored as sensitive environment variables

Confirm in the Vercel dashboard before public launch:

- exact Vercel plan
- project owner/team
- spend alerts
- deployment protection settings
- whether WAF, Log Drains, Observability Plus, Speed Insights, or Fluid Compute are available on the active plan

## Executive Summary

AskSafe Home has a good competition-stage production foundation:

- GitHub to Vercel production deployment works
- `main` deploys automatically
- `pnpm-lock.yaml` is committed
- Vercel Analytics is enabled in production
- API routes have production smoke-test evidence
- DynamoDB metadata persistence is production-verified
- Bedrock is default-off and protected by runtime guardrails
- AWS runtime credentials are scoped and documented as temporary
- baseline security headers are configured in `next.config.mjs`
- event API routes have a lightweight in-memory rate-limit baseline

The largest launch gaps are:

- CSP is report-only and should be tightened after production observation
- rate limiting is a competition baseline and should move to durable edge or
  distributed controls before broader public launch
- image optimization remains disabled for the current static local asset setup
- no documented Vercel spend alert state
- no documented Vercel deployment protection/WAF/log drain state

## Status Legend

- **Handled:** already present in code, docs, or verified production evidence
- **Needed before judging:** useful before submission or demo, scoped enough to do soon
- **Soon after judging:** important, but not worth blocking the current submission path
- **Not applicable now:** not needed for the current architecture or plan
- **Enterprise / plan dependent:** depends on paid Vercel features or enterprise account features

## Operational Excellence

| Checklist item | AskSafe status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Incident response plan | Handled | `docs/operations/incident-response-and-rollback-runbook.md` | Keep runbook updated after production incidents |
| Staging, promotion, rollback | Handled | GitHub `main` deploys; Vercel rollback and GitHub revert are documented in the runbook | Use the runbook during incidents and record smoke-test evidence |
| Monorepo build caching | Not applicable now | Single Next.js app, no Turborepo | Skip unless repo becomes monorepo |
| Zero downtime DNS migration | Soon after judging | Current production uses `asksafe-home.vercel.app`; `asksafe.ai` may be added later | Do only when custom domain is ready; keep Vercel domain for judging fallback |

## Security

| Checklist item | AskSafe status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Content Security Policy and security headers | Partly handled | `next.config.mjs` sets HSTS, content-type, referrer, frame, permissions, and CSP report-only headers; `next.config.test.mjs` covers the baseline | Observe production behavior, then move CSP from report-only to enforced if safe |
| Deployment Protection | Needed before judging | Dashboard state not documented | Enable for preview deployments if available; keep production public for judges |
| Vercel WAF custom rules | Soon after judging / plan dependent | No dashboard evidence | For competition, consider simple bot/rate controls only if available; full WAF can wait |
| Log Drains | Soon after judging / plan dependent | No dashboard evidence | Useful after launch; not needed for current demo if logs are monitored manually |
| SSL certificate issues | Not applicable now | Vercel domain handles TLS | Recheck when adding `asksafe.ai` |
| Preview Deployment Suffix | Not applicable now | No custom domain preview suffix needed | Skip for competition |
| Commit lockfiles | Handled | `pnpm-lock.yaml` committed | Keep lockfile updated |
| Rate limiting | Partly handled | `/api/safety-events`, `/api/feedback-events`, and `/api/support-events` use a shared in-memory baseline limiter with `429` responses | Replace or augment with durable Vercel WAF/KV/AWS edge controls before broader public launch |
| Access roles for team members | Needed before judging | Team access changed during setup; not documented | Document GitHub/Vercel roles and keep least privilege |
| SAML SSO / SCIM / Audit Logs | Enterprise / plan dependent | Not current scope | Skip |
| Allowed cookie policy | Not applicable now | No production auth cookies yet | Revisit when real authentication is added |
| Block unwanted bots | Soon after judging / plan dependent | No WAF/bot rule evidence | Consider after rate limiting and security headers |

## Reliability

| Checklist item | AskSafe status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Observability Plus | Plan dependent | Vercel Analytics is enabled; Observability Plus unknown | Keep Analytics; add Observability only if plan and budget allow |
| Function failover | Enterprise / plan dependent | Not available in current scope | Skip |
| Secure Compute passive failover | Enterprise / plan dependent | Not current architecture | Skip |
| Caching headers | Soon after judging | Static app pages are generated; no custom headers | Add security headers first; cache headers can follow |
| Caching vs ISR understanding | Not applicable now | No ISR pages | Skip until dynamic content pages exist |
| Distributed tracing | Soon after judging | No tracing instrumentation | Defer until more server routes and Bedrock calls exist |
| Load test | Not applicable now / Enterprise | Low-traffic competition app | Manual smoke tests are enough for judging |

## Performance

| Checklist item | AskSafe status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Speed Insights | Needed before judging if available | Analytics is enabled; Speed Insights state unknown | Enable Speed Insights if available and low cost |
| TTFB review | Needed before judging | App builds static home page; API routes are simple | Use Vercel dashboard after next deploy; watch DynamoDB API latency |
| Image Optimization | Partly handled | `images.unoptimized=true` remains in `next.config.mjs` and is covered by `next.config.test.mjs` | Keep disabled for current static local assets; revisit after historical screenshots and asset storage are cleaned up |
| Script Optimization | Not applicable now | No third-party script load except Vercel Analytics | Keep minimal scripts |
| Font Optimization | Handled | Uses `next/font/google` | Keep using bundled font optimization |
| Function region matches API/database region | Needed before judging | DynamoDB is `ap-southeast-2`; Vercel function region not documented | Consider setting Vercel function region close to AWS region if supported |
| Third-party proxy limitations | Not applicable now | No proxy architecture | Skip |

## Cost Optimization

| Checklist item | AskSafe status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Fluid Compute | Plan dependent | Not documented | Enable only if available and cost-neutral |
| Manage and optimize usage | Partly handled | Bedrock FinOps guardrails documented; DynamoDB is pay-per-request | Add Vercel spend alert evidence |
| Spend Management and alerts | Needed before judging | AWS Budgets documented; Vercel alert state unknown | Configure Vercel spend alerts and capture evidence |
| Function max duration and memory | Soon after judging | No explicit function config | Keep routes simple; tune only if Bedrock integration increases duration |
| ISR revalidation | Not applicable now | No ISR content | Skip |
| New image optimization pricing | Plan/account dependent | Team creation date unknown | Check only if using Vercel image optimization heavily |
| Large media in Blob storage | Soon after judging | Many screenshot PNGs are committed at repo root; production uses small public images | Move historical screenshots into docs or external storage later; do not block judging |

## Competition-Stage Priority List

### P0 Completed Before Public Judging

1. Add incident response and rollback runbook.
2. Add baseline security headers and a conservative CSP plan.
3. Add a competition-stage rate-limit baseline for event APIs.

### P0 Remaining Before Public Judging

1. Confirm Vercel spend alerts and AWS budget alerts are enabled.
2. Confirm production environment variables are scoped and sensitive where needed.

### P1 Useful Before Final Submission

1. Enable Speed Insights if available.
2. Review function region against AWS `ap-southeast-2`.
3. Decide whether to re-enable image optimization.
4. Document deployment protection for preview deployments.
5. Document team access roles.

### P2 After Competition

1. Add Log Drains or another durable logging path.
2. Add richer observability and tracing for Bedrock calls.
3. Rotate or remove the temporary Vercel AWS runtime access key.
4. Decide whether production hosting should remain on Vercel or move toward AWS-native runtime roles.
5. Move historical screenshots out of the app root.

## Recommended Next PRs

1. `p6.1-incident-rollback-runbook`
   - Add incident response, rollback, and credential-disablement instructions.
2. `p6.2-security-headers-baseline`
   - Add baseline headers and CSP report-only coverage.
3. `p6.3-api-rate-limiting`
   - Add a small rate-limiting strategy for event APIs.
4. `p6.4-build-config-hardening`
   - Remove `ignoreBuildErrors`, document image optimization choice, and verify production build.

## Launch Decision

AskSafe Home is production-shaped for a competition demo, but not yet production-hardened for a public consumer launch.

The app can be judged as shippable software because the core safety workflow, production deployment, DynamoDB persistence, and fallback-first Bedrock foundation are real. Before broader public launch, finish the P0 checklist above.
