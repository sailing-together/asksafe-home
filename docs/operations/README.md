# AskSafe Home Operations Docs

This folder contains the operational evidence and checklists used to prepare
AskSafe Home for demos, judging, and production smoke checks.

## Start Here Before Recording

1. Read `demo-readiness-checklist.md`.
2. Keep `demo-scenarios-checklist.md` open for the scenario script.
3. Use `demo-scenario-run-log.md` as the latest API-level evidence.
4. If production changed after the latest evidence, rerun the smoke checks in
   `production-smoke-tests.md`.

## Demo And Scenario Evidence

- `demo-readiness-checklist.md`
  - Practical checklist for recording the demo video.
  - Includes production URL, recommended demo flow, manual UI pass, and how to
    explain Bedrock fallback.
- `demo-scenarios-checklist.md`
  - Defines the five synthetic demo scenarios and expected outcomes.
  - Use this as the source script for team practice and demo recording.
- `demo-scenario-run-log.md`
  - Records the latest production `/api/analyze` run for the five demo
    scenarios.
  - Confirms expected risk levels and notes Bedrock / deterministic fallback
    outcomes.

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

## Demo Safety Rules

- Use synthetic examples only.
- Do not enter real passwords, one-time codes, card numbers, phone numbers, or
  identity details.
- Do not claim AskSafe can prove whether a message, voice, image, or video is
  real or fake.
- Explain that deterministic safety rules are the baseline and Bedrock assists
  wording only when the output passes safety checks.
- Keep the story focused on reducing uncertainty, fear, and decision pressure
  for seniors.
