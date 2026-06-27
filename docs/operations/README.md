# AskSafe Home Operations Docs

This folder contains the operational evidence and checklists used to prepare
AskSafe Home for product walkthroughs, judging, and production smoke checks.

## Start Here Before Recording

1. Read `release-readiness-summary.md` for the shippable software evidence,
   current limits, and release decision.
2. Read `product-walkthrough-narrative-brief.md` for the story, positioning,
   and judge Q&A talking points.
3. Read `product-walkthrough-readiness-checklist.md`.
4. Keep `release-validation-scenarios-checklist.md` open for the scenario script.
5. Use `release-scenario-run-log.md` as the latest API-level evidence.
6. Use `manual-ui-walkthrough-pass.md` for the browser-level product
   walkthrough pass.
7. If production changed after the latest evidence, rerun the smoke checks in
   `production-smoke-tests.md`.

## Product Walkthrough And Release Evidence

- `release-readiness-summary.md`
  - Top-level release summary for shippable software evidence, known limits,
    product walkthrough focus, and release decision.
- `product-walkthrough-narrative-brief.md`
  - Short speaking brief for the final product walkthrough story, product
    positioning, judge Q&A, and team speaking roles.
- `product-walkthrough-readiness-checklist.md`
  - Practical checklist for recording the product walkthrough video.
  - Includes production URL, recommended product walkthrough flow, manual UI
    pass, and how to explain Bedrock fallback.
- `release-validation-scenarios-checklist.md`
  - Defines the five synthetic release validation scenarios and expected outcomes.
  - Use this as the source script for team practice and product walkthrough recording.
- `release-scenario-run-log.md`
  - Records the latest production `/api/analyze` run for the five product
    walkthrough scenarios.
  - Confirms expected risk levels and notes Bedrock / deterministic fallback
    outcomes.
- `manual-ui-walkthrough-pass.md`
  - Records the browser-level checks to complete before product walkthrough recording.
  - Covers desktop, mobile, voice input, read-aloud, trusted support, official
    help, and recording fallbacks.

## Production Smoke Evidence

- `production-smoke-tests.md`
  - Records production checks for DynamoDB event persistence and Bedrock analyze
    route behavior.
  - Includes commands to rerun smoke tests against production.
- `launch-settings-evidence.md`
  - Tracks dashboard-level launch settings and environment configuration
    evidence.
- `vercel-production-readiness.md`
  - Maps AskSafe Home against Vercel's production checklist.
  - Separates competition-stage readiness from broader public-launch hardening.

## Incident And Rollback

- `incident-response-and-rollback-runbook.md`
  - Use if production is down, unsafe output appears, AWS credentials need to be
    disabled, or a deployment needs rollback.

## Product Walkthrough Safety Rules

- Use synthetic examples only.
- Do not enter real passwords, one-time codes, card numbers, phone numbers, or
  identity details.
- Do not claim AskSafe can prove whether a message, voice, image, or video is
  real or fake.
- Explain that deterministic safety rules are the baseline and Bedrock assists
  wording only when the output passes safety checks.
- Keep the story focused on reducing uncertainty, fear, and decision pressure
  for seniors.
