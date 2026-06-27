# Release Readiness Summary

This summary explains why AskSafe Home can be presented as shippable software for
product review and competition judging. It links to the deeper evidence rather
than repeating every checklist.

## Release Position

AskSafe Home is a production-deployed senior safety decision workflow. It helps a
user pause before acting on uncertain requests, notice risk signals, choose a
safer next step, and decide whether to involve someone they trust.

The product is intentionally not framed as a generic chatbot or as a tool that
proves whether a message, voice, image, or video is real or fake.

## Production Entry Point

- Production URL: `https://asksafe-home.vercel.app`
- Production branch: `main`
- Vercel project: `asksafe-home`
- AWS region: `ap-southeast-2`
- Bedrock inference profile: `au.anthropic.claude-haiku-4-5-20251001-v1:0`

## Shippable Product Evidence

### Core User Workflow

AskSafe Home has a complete user-facing safety flow:

1. Start from the home screen.
2. Choose the uncertain situation type.
3. Describe what happened by typing or voice.
4. Select what the other person is asking for.
5. Receive a result with safer next step, risk signals, not-yet actions,
   verification steps, trusted support, and official help.
6. Start another check if needed.

Supporting evidence:

- `product-walkthrough-readiness-checklist.md`
- `release-validation-scenarios-checklist.md`
- `manual-ui-walkthrough-pass.md`

### Safety Logic And AI Boundary

The product uses deterministic safety rules as the baseline. Bedrock can improve
response wording, but the AI output is checked against safety invariants before
it is shown. If the AI output is unavailable, invalid, or unsafe, AskSafe falls
back to the deterministic result.

Supporting evidence:

- `production-smoke-tests.md`
- `release-scenario-run-log.md`
- `../architecture/bedrock-ai-orchestration-finops-design.md`
- `../architecture/cloud-ai-foundation-design.md`

### Production Persistence

AskSafe Home uses AWS-backed persistence for privacy-safe operational events.
The event model is designed to support product quality and release verification
without asking users to enter passwords, one-time codes, full card numbers, or
sensitive identity details.

Supporting evidence:

- `production-smoke-tests.md`
- `release-scenario-run-log.md`
- `../architecture/cloud-ai-foundation-design.md`

### Trusted Support And Official Help

The product supports two routes after a safety result:

- user-controlled trusted support, where nothing is shared unless the user
  chooses to share it
- official Australian help paths for emergency support, Scamwatch, IDCARE, and
  cyber safety support

This keeps AskSafe in the role of a calm decision companion rather than an
emergency service, government service, legal adviser, financial adviser, or
medical adviser.

Supporting evidence:

- `product-walkthrough-narrative-brief.md`
- `product-walkthrough-readiness-checklist.md`

### Release Operations

The product has basic release operations documentation for production checks,
launch settings, incident response, rollback, and Vercel readiness.

Supporting evidence:

- `production-smoke-tests.md`
- `launch-settings-evidence.md`
- `incident-response-and-rollback-runbook.md`
- `vercel-production-readiness.md`

## Known Limits

These limits are intentional for the current release stage:

- AskSafe does not prove whether a video, voice, image, or message is real.
- AskSafe does not replace banks, police, Scamwatch, emergency services, legal
  advice, financial advice, or medical advice.
- AskSafe does not provide a family monitoring dashboard.
- AskSafe should not ask users to enter passwords, one-time codes, full card
  numbers, or sensitive identity details.
- Door or doorstep scenarios are supported as secondary senior-safety moments,
  but the release story focuses on remote and digital pressure.

## Product Walkthrough Focus

The strongest product walkthrough scenario is the daughter video money request:

```text
My daughter asked me on a video call to send 2000 AUD today.
```

This scenario shows the product's value clearly: it reduces urgency, fear, and
decision pressure without accusing the family member or claiming to prove the
video is fake.

Use the product walkthrough materials here:

- `product-walkthrough-narrative-brief.md`
- `product-walkthrough-readiness-checklist.md`
- `release-validation-scenarios-checklist.md`

## Release Decision

AskSafe Home is ready to be presented as shippable software for review because
it has:

- a deployed production web app
- a complete senior-facing safety workflow
- deterministic safety rules
- guarded Bedrock response generation
- AWS-backed privacy-safe event persistence
- clickable official help links
- user-controlled trusted support
- production smoke evidence
- release operations and rollback documentation

Before broader public launch, the team should continue hardening authentication,
observability, security policy enforcement, cost controls, domain configuration,
and deeper user research.