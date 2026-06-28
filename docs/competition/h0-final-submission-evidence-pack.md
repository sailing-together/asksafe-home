# H0 Final Submission Evidence Pack

Source checklist: `docs/competition/h0-submission-checklist.md`
Production URL: `https://asksafe-home.vercel.app`
Primary AWS database: Amazon DynamoDB
Recommended track: Track 4, Open Innovation

This document is the final working pack for preparing the H0 submission. It is
intended to keep the team focused on shippable product evidence, not extra
feature work.

## Submission Owner Checklist

Complete these before submitting:

- [ ] Production app opens on desktop and mobile.
- [ ] Core safety check works without requiring login.
- [ ] Result page shows safer next step, risk signals, hold-off actions,
      verification steps, official help, trusted support, and feedback.
- [ ] DynamoDB evidence screenshot is captured.
- [ ] Architecture diagram is ready.
- [ ] Product walkthrough video is recorded, public, and under 3 minutes.
- [ ] Devpost text fields are drafted and reviewed.
- [ ] GitHub repository link is correct.
- [ ] Vercel production URL is correct.
- [ ] Vercel Team ID is available for the Devpost form.
- [ ] AWS database field says DynamoDB.
- [ ] No submission wording claims AskSafe can prove whether something is real
      or fake.

## Production URL Evidence

Use:

```text
https://asksafe-home.vercel.app
```

Check these paths in the browser:

- [ ] Home screen
- [ ] Situation selection
- [ ] Guided input or voice path
- [ ] Result screen for a risky money request
- [ ] Result screen for a lower-risk or unclear request
- [ ] My setup modal
- [ ] Footer links and official help links

Recommended browser checks:

- [ ] Chrome desktop
- [ ] Mobile viewport or a real phone
- [ ] One refresh after completing a flow
- [ ] One new incognito session

## DynamoDB Evidence Screenshot

Capture at least one clean screenshot proving AskSafe uses DynamoDB.

Preferred screenshot:

- AWS Console
- DynamoDB
- Tables
- show `asksafe-home-prod-*` tables

Optional second screenshot:

- item view from `asksafe-home-prod-events`
- item view from `asksafe-home-prod-feedback`
- item view from `asksafe-home-prod-support-events`
- quota counter item related to Bedrock cost controls

Safe screenshot rules:

- Do not show AWS access keys.
- Do not show billing details.
- Do not show raw user messages.
- Do not show real phone numbers, emails, passwords, one-time codes, card
  numbers, or identity details.
- Use synthetic test data only.

## Architecture Diagram Evidence

The architecture diagram should show:

- Senior user browser on mobile or desktop
- Vercel-hosted Next.js App Router application
- v0-created UI foundation
- Next.js API routes
- deterministic safety rules engine
- optional Amazon Bedrock explanation assist
- Bedrock validation and safety invariant gate
- Amazon DynamoDB tables
- Terraform-managed AWS infrastructure
- GitHub Actions infrastructure workflow
- Vercel environment variables
- scoped AWS runtime role
- FinOps controls: rate limit, input cap, Bedrock quota hard stop, AWS budget

One-line architecture narrative:

```text
AskSafe Home runs on Vercel, uses DynamoDB as the primary backend database for
privacy-safe product events and support outcomes, and uses Bedrock only through
a bounded, validated server-side explanation path with deterministic fallback.
```

## Product Walkthrough Video

Official limit:

- under 3 minutes
- public video link
- show product functioning
- explain AWS database usage

Recommended structure:

1. Product problem, 15 seconds
2. Home and guided safety flow, 35 seconds
3. Risk result page, 45 seconds
4. Trusted support and official help, 25 seconds
5. DynamoDB and Bedrock evidence, 35 seconds
6. Privacy, dignity, and FinOps controls, 20 seconds
7. Closing impact statement, 5 seconds

Avoid saying:

- demo
- prototype
- fake detection
- guaranteed scam detection
- family monitoring

Prefer saying:

- working product
- product walkthrough
- safety decision workflow
- helps seniors pause and choose a safer next step
- privacy-safe metadata
- user-controlled trusted support

## Suggested Video Script

Short version:

```text
AskSafe Home is a safety decision companion for older adults when a message,
call, video chat, or payment request feels uncertain.

Instead of asking a senior to judge whether something is real or fake, AskSafe
helps them pause, describe what happened, see the risk signals, and choose one
safer next step.

Here is a common situation: someone close to the user asks for money during a
video call. AskSafe asks for the context, identifies pressure signals, explains
what to hold off on, and gives a safer verification path before sending money.

The user can optionally set up someone they trust and share a safety summary.
Nothing is shared automatically.

AskSafe is built as a full-stack product on Vercel with Next.js. DynamoDB is the
primary backend database for privacy-safe safety events, feedback outcomes,
trusted support actions, user setup, and Bedrock quota counters.

Bedrock is used as a bounded explanation assistant behind server-side
validation, deterministic fallback, input limits, rate limits, and quota hard
stops. The product is designed to reduce uncertainty, fear, loneliness, and
decision pressure for seniors while keeping them in control.
```

## Devpost Field Drafts

### Tagline

```text
AskSafe Home helps seniors pause, understand risk signals, and choose a safer
next step when a message, call, video chat, or payment request feels uncertain.
```

### What it does

```text
AskSafe Home is a safety decision companion for older adults. It guides a user
through one uncertain situation at a time, asks what happened, highlights risk
signals, explains what to hold off on, and suggests safer verification steps.
The user can optionally involve someone they trust and can use official
Australian help channels when needed.
```

### How we built it

```text
AskSafe Home is built with Next.js App Router, TypeScript, React, Tailwind,
shadcn/ui, and deployed on Vercel. The first UI foundation was rapidly explored
with v0, then hardened with production routes, persistence, testing, and
operational controls. DynamoDB is the primary backend database for privacy-safe
safety events, feedback, support actions, user setup, household setup, and
Bedrock quota counters. Amazon Bedrock provides bounded explanation assistance
behind validation, deterministic fallback, and FinOps guardrails. Terraform and
GitHub Actions manage AWS infrastructure.
```

### Challenges

```text
The hardest part was avoiding a generic chatbot or a claim that AI can prove
whether something is real. AskSafe needed to feel calm, senior-friendly, and
practical while still being technically shippable. We also had to balance AI
assistance with privacy, safety invariants, cost controls, and deterministic
fallback behavior.
```

### Accomplishments

```text
We built a full-stack safety decision workflow with a live Vercel deployment,
DynamoDB persistence, Bedrock-assisted explanation, trusted support actions,
official help links, production smoke checks, Terraform-managed AWS
infrastructure, and FinOps hard stops.
```

### What we learned

```text
The strongest product direction is not "scam detector". It is a safety
decision workflow that helps seniors pause before acting, understand what makes
a request risky, and choose a safer next step while staying in control.
```

### What's next

```text
Next steps include deeper guided clarification, richer trusted support flows,
more official verification pathways, image or screenshot review, stronger
accessibility testing with seniors, and expanded partnerships with community,
aged care, banking, and public safety organizations.
```

## Judge Testing Instructions

Use this concise version in the submission:

```text
Open the production URL and choose "I feel unsure about something". No login is
required for the core safety check.

Suggested scenarios:
1. A family member asks for money during a video call.
2. A bank message says an account will close unless the user taps a link.
3. A tech support caller asks the user to install an app or share their screen.

Please use synthetic information only. Do not enter real passwords, one-time
codes, full card numbers, identity details, or real contact details.
```

## Final Smoke Checks

Run or verify:

- [ ] production app loads
- [ ] production analysis route returns a result
- [ ] safety event persistence smoke passes
- [ ] feedback event persistence smoke passes
- [ ] support event persistence smoke passes
- [ ] Bedrock analyze smoke passes or deterministic fallback is documented
- [ ] Bedrock quota smoke is available and documented
- [ ] Vercel deployment is green
- [ ] GitHub Actions are green or documented

Suggested commands:

```bash
npm run test
npm run typecheck
npm run build
npm run smoke:outcome:production
npm run smoke:bedrock:production
```

Only run Bedrock quota exhaustion checks with a temporary low quota and after
confirming the expected cost impact.

## Final Review Questions

Before submission, answer:

- [ ] Does this reduce uncertainty for seniors?
- [ ] Does this reduce fear, loneliness, or decision pressure?
- [ ] Are we avoiding unsupported claims?
- [ ] Is the AWS database usage visible and explainable?
- [ ] Is the product still available at the production URL?
- [ ] Is the walkthrough video under 3 minutes?
- [ ] Is all evidence safe to share publicly?
