# H0 Devpost Submission Copy

Production URL: `https://asksafe-home.vercel.app`
Recommended track: Track 4, Open Innovation
Primary AWS database: Amazon DynamoDB

This document contains draft copy that can be pasted into the H0 Devpost
submission form. Keep claims practical and avoid implying that AskSafe can prove
whether a message, caller, or video is real.

## Project Name

```text
AskSafe Home
```

## One-Line Tagline

```text
A safety decision companion that helps seniors pause, understand risk signals,
and choose a safer next step when something feels uncertain.
```

## Short Description

```text
AskSafe Home helps older adults respond more safely when a message, call, video
chat, or payment request feels uncertain. It guides the user through one
situation at a time, highlights risk signals, explains what to hold off on, and
suggests practical verification steps before they act.
```

## Inspiration

```text
Many older adults face high-pressure requests through messages, calls, video
chats, online pop-ups, and payment situations. The hardest moment is often not
technical detection. It is the decision pressure: "Should I click this, send
money, share a code, install an app, or call this number?"

AskSafe Home was inspired by that moment of uncertainty. We wanted to build a
calm, senior-friendly workflow that helps someone pause, understand what makes a
situation risky, and decide what safer action to take next while staying in
control.
```

## What It Does

```text
AskSafe Home is an AI-assisted safety decision companion for older adults.

The user chooses the kind of situation they are unsure about, describes what
happened, and can add what the other person is asking them to do. AskSafe then
returns a structured safety result with:

- a clear safer next step
- risk signals that stood out
- what not to do yet
- why the situation is worth pausing on
- verification steps
- official Australian help pathways when relevant
- optional trusted support chosen by the user

The product is not a generic chatbot and does not claim to prove whether a
message, caller, or video is real. It is a practical safety decision workflow
designed to reduce uncertainty, fear, loneliness, and decision pressure before a
user takes risky action.
```

## How We Built It

```text
AskSafe Home is built as a full-stack web product with Next.js App Router,
TypeScript, React, Tailwind, shadcn/ui, and Vercel.

We used v0 to rapidly explore and refine the senior-friendly UI, then hardened
the product with application routes, deterministic safety logic, persistence,
production checks, and operational guardrails.

Amazon DynamoDB is the primary backend database. It stores privacy-safe safety
event metadata, feedback outcomes, trusted support action events, user setup,
household setup, and Bedrock quota counters.

Amazon Bedrock provides bounded explanation assistance. Bedrock output is
validated server-side before use, with deterministic fallback, safety
invariants, rate limits, input length limits, and quota hard stops to manage
safety and cost.

AWS infrastructure is managed with Terraform and GitHub Actions. The production
app runs on Vercel and uses scoped AWS runtime configuration.
```

## AWS Database Usage

```text
AskSafe Home uses Amazon DynamoDB as the primary backend database.

DynamoDB is used for privacy-safe product events and workflow evidence rather
than storing raw sensitive messages. The app records safety event metadata,
feedback events, trusted support actions, user and household setup data, and
Bedrock quota counters used for FinOps hard stops.

This lets the product support a real backend workflow while minimizing
sensitive data collection.
```

## Challenges

```text
The main product challenge was avoiding a generic chatbot or a risky "scam
detector" claim. In high-pressure situations, the product should not pretend it
can prove whether something is real or fake. It should help the user pause,
notice risk signals, and choose a safer next step.

The main engineering challenge was adding AI assistance without giving up
control. We built a bounded Bedrock path with server-side validation,
deterministic fallback, safety invariants, and FinOps guardrails so the product
can remain shippable and cost-aware.

We also had to keep the experience senior-friendly: large readable text, calm
visual design, minimal choices, one task at a time, voice support, and clear
official help pathways.
```

## Accomplishments

```text
We built and deployed a working full-stack safety decision product.

Key accomplishments include:

- Vercel production deployment
- senior-friendly guided safety workflow
- deterministic risk signal and safer-next-step logic
- Bedrock-assisted explanation with validation and fallback
- DynamoDB-backed safety, feedback, support, setup, and quota events
- trusted support flow that is user-controlled
- official Australian help pathways
- Terraform-managed AWS infrastructure
- GitHub Actions infrastructure workflow
- production smoke checks and release documentation
- FinOps controls for rate limits, input caps, Bedrock quotas, and budget
  awareness
```

## What We Learned

```text
The strongest direction for AskSafe is not "AI scam detection". It is a safety
decision workflow.

For seniors, the most valuable product moment is often the pause before an
action: before sending money, clicking a link, sharing a code, installing an
app, or calling a number from a message.

We also learned that trust requires boundaries. AI can help explain, but the
product must still use structured safety logic, official verification steps,
privacy minimization, and clear disclaimers.
```

## What Is Next

```text
Next steps include deeper guided clarification, better support for screenshots
and images, stronger trusted support workflows, more official verification
pathways, accessibility testing with older adults, and partnerships with
community organizations, aged care providers, banks, councils, and public safety
groups.

We also plan to continue improving the AI orchestration layer so AskSafe can ask
better follow-up questions while keeping deterministic safety boundaries and
cost controls.
```

## Built With

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
Vercel
v0
Amazon DynamoDB
Amazon Bedrock
AWS IAM
AWS Budgets
Terraform
GitHub Actions
```

## Testing Instructions

```text
Open the production URL and choose "I feel unsure about something".

No login is required for the core safety check.

Suggested scenarios:

1. A family member asks for money during a video call.
2. A bank message says the account will close unless the user taps a link.
3. A tech support caller asks the user to install an app or share their screen.

Please use synthetic information only. Do not enter real passwords, one-time
codes, full card numbers, identity details, or real contact details.
```

## Video Title

```text
AskSafe Home Product Walkthrough
```

## Video Description

```text
AskSafe Home is a safety decision companion for older adults when a message,
call, video chat, or payment request feels uncertain. This product walkthrough
shows the live Vercel app, the guided safety workflow, trusted support,
official help, DynamoDB-backed product events, and bounded Bedrock assistance
with FinOps guardrails.
```

## Public Submission Notes

Use these phrases:

- safety decision companion
- safety decision workflow
- helps seniors pause
- risk signals
- safer next step
- verification steps
- privacy-safe metadata
- user-controlled trusted support
- bounded Bedrock assistance
- DynamoDB-backed product workflow

Avoid these phrases:

- demo
- prototype
- scam detector
- AI proves it is fake
- detects all scams
- monitors seniors
- family surveillance
- replaces emergency, legal, financial, medical, or government services
