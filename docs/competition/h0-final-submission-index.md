# H0 Final Submission Index

Production URL: `https://asksafe-home.vercel.app`
Repository: `https://github.com/sailing-together/asksafe-home`
Primary AWS database: Amazon DynamoDB
Recommended track: Track 4, Open Innovation

This is the single entry point for final H0 submission preparation.

## Core Submission Files

- Official rules archive:
  `docs/competition/h0-official-rules-archive.md`
- Rules-to-deliverables checklist:
  `docs/competition/h0-submission-checklist.md`
- Final evidence pack:
  `docs/competition/h0-final-submission-evidence-pack.md`
- Product walkthrough script:
  `docs/competition/h0-product-walkthrough-script.md`
- Devpost-ready submission copy:
  `docs/competition/h0-devpost-submission-copy.md`
- Final production smoke record:
  `docs/competition/h0-final-release-smoke-record.md`
- Canonical product architecture overview:
  `docs/architecture/asksafe-home-architecture-overview.md`
- Visual architecture diagram asset:
  `docs/assets/architecture/asksafe-home-architecture.svg`
- Editable draw.io architecture source:
  `docs/assets/architecture/asksafe-home-architecture.drawio`
- Architecture icon source notes:
  `docs/assets/architecture/ICON_SOURCES.md`
- Architecture diagram source and description:
  `docs/competition/h0-architecture-diagram.md`
- Architecture evidence checklist:
  `docs/competition/h0-architecture-evidence-checklist.md`

## Final Submission Order

1. Confirm production app is available:
   `https://asksafe-home.vercel.app`
2. Capture DynamoDB evidence screenshot.
3. Use the checked-in final architecture diagram:
   `docs/assets/architecture/asksafe-home-architecture.svg`.
4. Record product walkthrough video under 3 minutes.
5. Upload video publicly.
6. Fill Devpost fields using `h0-devpost-submission-copy.md`.
7. Fill remaining placeholders in `h0-final-release-smoke-record.md`.
8. Review submission against `h0-submission-checklist.md`.
9. Submit before the H0 deadline.

## Current Verified Evidence

From `docs/competition/h0-final-release-smoke-record.md`:

- Production URL returned HTTP/2 200.
- Safety event smoke persisted to DynamoDB.
- Feedback event smoke persisted to DynamoDB.
- Support event smoke persisted to DynamoDB.
- Bedrock analyze smoke used Bedrock successfully.
- Bedrock analyze smoke returned `bedrockOutcome: "success"`.
- Architecture diagram is checked in at `docs/assets/architecture/asksafe-home-architecture.svg`.

## Evidence Still To Fill

These must still be filled manually before submission:

- Product walkthrough video URL
- Devpost submission URL
- DynamoDB screenshot link or path
- Vercel Team ID
- Final browser walkthrough notes
- Final GitHub Actions / Vercel deployment status if needed

## Submission Positioning

Use this framing:

```text
AskSafe Home is a safety decision companion for older adults when a message,
call, video chat, or payment request feels uncertain.
```

Do not frame the product as:

- a universal scam detector
- proof that a caller, message, or video is real or fake
- family surveillance
- a replacement for emergency, legal, financial, medical, or government help

## Required Devpost Materials

- Project name: AskSafe Home
- Tagline: see `h0-devpost-submission-copy.md`
- Description: see `h0-devpost-submission-copy.md`
- Built with: Next.js, TypeScript, React, Tailwind, shadcn/ui, Vercel, v0,
  Amazon DynamoDB, Amazon Bedrock, Terraform, GitHub Actions
- AWS database: DynamoDB
- Published Vercel app link: `https://asksafe-home.vercel.app`
- GitHub repository link: `https://github.com/sailing-together/asksafe-home`
- Product walkthrough video link: `TBD`
- Architecture diagram: `docs/assets/architecture/asksafe-home-architecture.svg`
- DynamoDB evidence screenshot: `TBD`
- Vercel Team ID: `TBD`

## Final Product Walkthrough Scenario

Recommended recorded scenario:

```text
My daughter asks me to send 2000 AUD after a video call.
```

Why this scenario works:

- It shows a realistic high-pressure family request.
- It demonstrates video-call uncertainty without claiming deepfake detection.
- It highlights the safer-next-step workflow.
- It shows trusted support and verification.
- It lets us explain why AskSafe is not a generic chatbot.

## Last-Minute Go / No-Go Check

Submit only if:

- [ ] production URL works from a clean browser session
- [ ] video is public and under 3 minutes
- [ ] DynamoDB usage is visible in screenshot evidence
- [ ] architecture diagram matches the actual implementation
- [ ] Devpost text does not overclaim AI capability
- [ ] no secrets or real personal data appear in screenshots or video
- [ ] final smoke record is updated with known evidence
