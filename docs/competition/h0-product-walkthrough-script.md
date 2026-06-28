# H0 Product Walkthrough Script

Production URL: `https://asksafe-home.vercel.app`
Target length: 2 minutes 30 seconds to 2 minutes 50 seconds
Maximum allowed length: under 3 minutes

This script is written for a shippable product walkthrough. Avoid describing
AskSafe Home as a demo or prototype in our own narration.

## Recording Setup

Before recording:

- Use a clean Chrome profile or incognito window.
- Set browser zoom to 100%.
- Open the production URL.
- Prepare one synthetic risky scenario:
  `My daughter asks me to send 2000 AUD after a video call.`
- Prepare the AWS Console DynamoDB tables page in another tab.
- Prepare the architecture diagram if it will be shown in the video.
- Do not show AWS keys, secrets, billing, real emails, real phone numbers, real
  messages, or real contact details.

Recommended screen order:

1. AskSafe Home production app
2. safety flow
3. result page
4. trusted support and official help
5. DynamoDB table evidence
6. optional architecture diagram

## 3-Minute Timeline

| Time | Screen | Narration Goal |
| --- | --- | --- |
| 0:00-0:15 | Home | Explain problem and product in one sentence |
| 0:15-0:35 | Start flow | Show senior-friendly guided input |
| 0:35-1:15 | Scenario and result | Show safer next step, signals, hold-off actions |
| 1:15-1:35 | Support/help | Show trusted support and official help |
| 1:35-2:10 | AWS evidence | Show DynamoDB-backed product events and Bedrock guardrails |
| 2:10-2:35 | Architecture | Explain full-stack architecture briefly |
| 2:35-2:50 | Close | Tie back to impact and shippable product |

## Spoken Script

### 0:00-0:15 Opening

```text
AskSafe Home is a safety decision companion for older adults when a message,
call, video chat, or payment request feels uncertain.

The goal is simple: help someone pause, understand the risk signals, and choose
a safer next step before they act.
```

### 0:15-0:35 Guided Flow

```text
The product is designed for seniors: large text, calm visual design, one task at
a time, and no generic chatbot interface.

The user starts by choosing what feels uncertain, then describes what happened
in their own words. They can type or use voice.
```

### 0:35-1:15 Scenario Result

Use scenario:

```text
My daughter asks me to send 2000 AUD after a video call.
```

Narration:

```text
Here AskSafe does not claim to prove whether the person is real or fake.
Instead, it turns the situation into a safety decision workflow.

It gives a clear next step, shows what stood out, explains what to hold off on,
and gives practical verification steps, such as calling back through a trusted
number or asking a question only the real family member would know.
```

### 1:15-1:35 Trusted Support And Official Help

```text
AskSafe also supports a user-controlled trusted support loop. Nothing is shared
automatically. The user chooses whether to add someone they trust or share a
safety summary.

Official Australian help is available when it is relevant, including emergency
help, Scamwatch, IDCARE, and the Australian Cyber Security Centre.
```

### 1:35-2:10 DynamoDB And Bedrock Evidence

Show DynamoDB tables or safe item view.

```text
This is a full-stack product. The frontend runs on Vercel with Next.js, and
DynamoDB is the primary backend database.

We use DynamoDB for privacy-safe safety event metadata, feedback events,
trusted support actions, user setup, household setup, and Bedrock quota
counters.

Amazon Bedrock is used as a bounded explanation assistant. The server validates
Bedrock output, enforces safety invariants, keeps deterministic fallback, and
uses rate limits and quota hard stops to control cost and abuse.
```

### 2:10-2:35 Architecture

Show architecture diagram if available.

```text
The architecture combines a Vercel-hosted Next.js app, API routes, deterministic
safety rules, optional Bedrock assistance, DynamoDB persistence, Terraform
infrastructure, and GitHub Actions deployment checks.

The important design choice is that AI assists the wording, but the product
still keeps clear safety boundaries.
```

### 2:35-2:50 Closing

```text
AskSafe Home is not trying to be a universal scam detector. It is a practical
safety decision workflow that reduces uncertainty, fear, loneliness, and
decision pressure for seniors before they take risky action.
```

## Screen Capture Checklist

Capture these moments:

- [ ] Home page with AskSafe Home identity visible
- [ ] Situation selection
- [ ] Input page with typed or voice-entered scenario
- [ ] Result headline and safer next step
- [ ] What stood out / risk signals
- [ ] Hold-off actions
- [ ] Verification steps
- [ ] Official help in Australia
- [ ] Trusted support card
- [ ] Feedback card if visible
- [ ] DynamoDB table list or safe synthetic item view
- [ ] Architecture diagram

## Words To Use

Use:

- product walkthrough
- working product
- shippable product
- safety decision workflow
- safer next step
- risk signals
- verification steps
- privacy-safe metadata
- user-controlled trusted support
- bounded Bedrock assistance
- FinOps guardrails

Avoid:

- demo
- prototype
- scam detector
- proves it is fake
- detects all scams
- monitors seniors
- family surveillance
- replaces emergency or professional advice

## Product Claims Guardrail

Safe claim:

```text
AskSafe helps users notice risk signals and choose a safer next step.
```

Unsafe claim:

```text
AskSafe can tell whether the message, caller, or video is real.
```

If the video mentions AI, frame it this way:

```text
AI helps generate clearer explanations, but the product keeps deterministic
safety boundaries, validation, fallback, and cost controls.
```

## Devpost Video Title And Description

Title:

```text
AskSafe Home Product Walkthrough
```

Description:

```text
AskSafe Home is a safety decision companion for older adults when a message,
call, video chat, or payment request feels uncertain. This product walkthrough
shows the live Vercel app, the guided safety workflow, trusted support,
official help, DynamoDB-backed product events, and bounded Bedrock assistance
with FinOps guardrails.
```

## Backup Short Script

If the recording is running long, use this shorter narration:

```text
AskSafe Home helps older adults pause before responding to uncertain messages,
calls, video chats, or payment requests.

The product guides the user through one situation at a time, then gives a safer
next step, risk signals, hold-off actions, and verification steps.

The user can choose whether to involve someone they trust. Nothing is shared
automatically.

The app is built with Next.js on Vercel. DynamoDB is the primary backend
database for privacy-safe product events and setup data. Bedrock provides
bounded explanation assistance behind validation, deterministic fallback, rate
limits, and quota hard stops.

AskSafe is not a universal scam detector. It is a shippable safety decision
workflow designed to reduce uncertainty and decision pressure for seniors.
```
