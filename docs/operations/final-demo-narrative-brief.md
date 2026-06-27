# Final Demo Narrative Brief

Use this brief when preparing the AskSafe Home demo video, judge walkthrough, or
team pitch practice. It turns the product scope, demo scenarios, and operations
checklists into a single story the team can say out loud.

## One-Line Positioning

AskSafe Home is a safety decision workflow for seniors who feel unsure about a
message, call, video chat, payment request, link, code, or remote-access request.

It is not a generic chatbot and it does not claim to prove whether something is
real or fake. It helps the user pause, notice risk signals, choose a safer next
step, and decide whether to involve someone they trust.

## Main Demo Story

Lead with the daughter video money request scenario:

```text
My daughter asked me on a video call to send 2000 AUD today.
```

Why this story works:

- it is emotionally realistic without using real personal data
- it shows pressure, urgency, family trust, and uncertainty in one scenario
- it lets AskSafe avoid accusing the family member while still encouraging a
  safer verification path
- it demonstrates the difference between a scam detector and a decision support
  workflow

Core message to say:

> AskSafe does not tell the senior that their daughter is fake. It helps them
> pause before paying, notice risk signals, and verify through a trusted channel
> they already know.

## What To Show

Recommended demo path:

1. Open the production home screen.
2. Say AskSafe Home is designed for moments when a senior feels unsure and needs
   one calm next step.
3. Start the primary "I feel unsure" flow.
4. Choose "Video call or online chat".
5. Enter the daughter video money request scenario by typing or voice.
6. Select "Pay money".
7. Submit the check.
8. Walk through the result in this order:
   - safer next step
   - risk signals
   - what not to do yet
   - how to check it is real
   - trusted support
   - official help links
9. Explain that the product can continue working even when AI wording is not
   available because deterministic safety rules remain the baseline.
10. If time allows, briefly show a normal appointment reminder to demonstrate
    that AskSafe can stay calm when a situation does not look risky.

## What Not To Lead With

Do not lead the demo with:

- door or doorstep scenarios
- claims that AskSafe can prove whether a video, voice, or message is real
- family monitoring or caregiver surveillance
- a generic chatbot framing
- a promise that every risky request is definitely a scam

The "Someone at the door" category can remain in the product, but the pitch
should focus on remote and digital pressure: messages, calls, video chat,
payments, links, codes, and remote access.

## Judge Q&A Talking Points

### Why not call it a scam detector?

AskSafe is intentionally framed as a safety decision workflow. The goal is not
to replace banks, police, Scamwatch, or family judgement. The goal is to reduce
uncertainty and decision pressure before the user acts.

### How does AI fit in?

Deterministic safety rules provide the baseline risk assessment. Amazon Bedrock
helps generate clearer wording, but the response is validated against safety
invariants before it is shown. If the AI output is missing, invalid, or unsafe,
AskSafe falls back to the deterministic result.

### Why include trusted support?

Many seniors do not need more information; they need a low-pressure way to ask a
trusted person for a second opinion. AskSafe keeps this user-controlled: nothing
is shared unless the user chooses to share it.

### Why include official help?

Official help links give users a trusted path after the result. They support the
product promise that AskSafe is a companion for safer decisions, not a
replacement for emergency, government, legal, financial, or medical services.

### What is stored?

AskSafe stores privacy-safe event data to support product quality and demo
verification. The product warns users not to enter passwords, one-time codes,
full card numbers, or sensitive identity details.

### Why Vercel and AWS?

Vercel supports fast delivery of the senior-friendly web experience. AWS
provides production-grade infrastructure for event persistence and Bedrock AI
orchestration. Terraform and GitHub Actions make the infrastructure repeatable.

## Team Speaking Roles

Use these as loose guidance, not a rigid script.

### Yvonne

Architecture, cloud foundation, AWS, Bedrock safety boundary, privacy, and
production readiness.

### Cynthia

Product UI, full-stack AI product implementation, senior-friendly interaction,
voice/read-aloud experience, and front-end result quality.

### Yang

Business value, user problem, competition story, market relevance, demo flow,
and why the product reduces pressure at the moment of decision.

### Emilie

Product scope, business analysis, user journey, decision workflow framing, and
why the product avoids over-claiming.

## Closing Message

End with the product outcome, not the technology stack:

> AskSafe Home gives seniors a safer pause before they act. It helps them slow
> down, understand the risk signals, and choose one safer next step while staying
> in control of whether to involve someone they trust.
