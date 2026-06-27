# Product Scope Decisions

This document records product boundary decisions that affect demo narrative,
feature prioritisation, and future roadmap.

## P7.29: Digital-First Narrative, Senior-Safety-Compatible Product

Date: 2026-06-27
Decision owner: Product / BA review
Status: Active for competition demo

### Decision

AskSafe Home will use a digital-first narrative while remaining compatible with
broader senior-safety decision moments.

The demo and pitch should focus on:

- messages
- calls
- video chat
- payments
- links
- codes
- remote access

The product will not describe itself as "digital safety only."

### Door / Knock-At-Door Scope

The Step 1 option "Someone at the door" remains in the flow for now, but it is
not a primary demo or pitch scenario.

Why it remains:

- some older adults face real pressure from unexpected visitors, fake service
  workers, salespeople, or people requesting entry or payment
- the product goal is broader than scam detection: it helps a senior pause when
  a request feels uncertain
- keeping the option avoids disrupting the current shippable flow before demo

Why it is not foregrounded:

- the competition story is strongest around remote and digital pressure
- Bedrock, DynamoDB, safety rules, voice, and result workflows are best shown
  through message, call, video, payment, code, link, and remote-access scenarios
- over-emphasising door scenarios could make the product feel like a general
  home-safety app rather than a focused AI safety decision workflow

### Demo Guidance

Use daughter video money request, bank link, one-time code, remote access, and
normal appointment reminder as the main demo set.

Do not lead with door or doorstep scenarios unless asked about scope.

Suggested positioning:

> AskSafe Home helps seniors pause before acting on uncertain requests,
> especially messages, calls, video chats, payments, links, codes, and remote
> access. It can also support broader moments of uncertainty when a senior wants
> help choosing a safer next step.

### Future Options

After the competition, choose one of these product directions:

1. Hide door from Step 1 and route it through "Not sure yet".
2. Keep door as a secondary supported senior-safety scenario.
3. Expand door into a dedicated doorstep pressure workflow.

The decision should depend on user research and whether AskSafe is positioned
as digital scam safety or a broader senior-safety decision companion.
