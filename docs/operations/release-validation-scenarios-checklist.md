# Release Validation Scenarios Checklist

Use this checklist before recording product walkthroughs, running team reviews, or showing the
product to judges.

The goal is not to prove that AskSafe can decide whether something is real or
fake. The goal is to show that AskSafe helps someone pause, notice risk signals,
choose a safer next step, and decide whether to involve someone they trust.

## Release Validation Principles

- Use synthetic examples only.
- Do not enter real passwords, one-time codes, card numbers, phone numbers, or
  identity details.
- Show one task at a time.
- Explain that Bedrock assists wording, while deterministic safety rules remain
  the safety baseline.
- For family or trusted-person requests, avoid saying "this is definitely a
  scam." Say "pause and verify another way."

## Scenario 1: Daughter Video Call Asking For Money

Input:

```text
My daughter asked me on a video call to send 2000 AUD today.
```

Category:

- Video call or online chat

Request chips:

- Pay money

Expected result:

- Risk: high
- Headline should encourage pausing before sending money.
- Safer next step should tell the user to contact the person through a saved
  number or account.
- Not-yet actions should mention:
  - do not send money until verified another way
  - do not rely on face, voice, or video alone
  - do not use new contact or account details from the request

Why it matters:

This is the strongest AskSafe Home story: reduce pressure without shaming the
user or accusing their family.

## Scenario 2: Bank Message With A Link

Input:

```text
I received a text saying my bank account will be closed unless I tap a link and confirm my details today.
```

Category:

- A text or email

Request chips:

- Click a link
- Give personal details

Expected result:

- Risk: high
- Safer next step should stop the user from tapping the link.
- Verification should point to the bank app, official website typed manually, or
  the number on the back of the card.
- Not-yet actions should prevent entering passwords, codes, card details, or
  identity information.

Why it matters:

This shows that AskSafe handles a common message-based safety workflow.

## Scenario 3: One-Time Code Request

Input:

```text
Someone said they accidentally sent a code to my phone and asked me to read it back.
```

Category:

- A phone call

Request chips:

- Share a code

Expected result:

- Risk: high
- Safer next step should be direct: do not share the code.
- The result should not ask for more clarification before warning the user.
- Verification should recommend checking the official app or account directly.

Why it matters:

This demonstrates a hard-stop case where asking for more information could
increase risk.

## Scenario 4: Tech Support Screen Sharing

Input:

```text
A caller said my computer has been hacked and asked me to install an app and share my screen.
```

Category:

- A phone call

Request chips:

- Install an app
- Share my screen

Expected result:

- Risk: high
- Safer next step should say not to install anything or share the screen.
- Not-yet actions should prevent remote access, app install, banking activity,
  and payment during the call.
- Verification should recommend contacting support through an official channel
  or a trusted person.

Why it matters:

This shows AskSafe can respond to device-access and remote-control risk.

## Scenario 5: Normal Appointment Reminder

Input:

```text
My dentist reminder says my appointment is tomorrow at 10am.
```

Category:

- A text or email

Request chips:

- Not sure

Expected result:

- Risk: low
- The result should avoid alarming language.
- The safer next step should still encourage checking with a trusted source if
  something feels wrong.
- It should not invent risk signals that are not present.

Why it matters:

This proves AskSafe can stay calm when the situation does not look risky.

## Manual Pass Criteria

Before a product walkthrough, check that:

- The home screen loads on desktop and mobile.
- The "I feel unsure" flow reaches the result screen.
- Voice input is optional and does not block typed input.
- Read-aloud works on the result screen when supported by the browser.
- Trusted support can open from home and result screens.
- Official help links are visible and clickable.
- The result screen has a clear safer next step.
- The user can start another check.

## Production Smoke Checks

Run these before the final product walkthrough if production has changed:

```bash
node --no-warnings --experimental-strip-types scripts/smoke-outcome-events.ts https://asksafe-home.vercel.app
node --no-warnings --experimental-strip-types scripts/smoke-bedrock-analyze.ts https://asksafe-home.vercel.app --expect-bedrock
```

Expected:

- outcome event smoke returns persisted event IDs for safety, feedback, and
  support
- Bedrock analyze smoke returns `bedrockUsed: true` and `bedrockOutcome:
  "success"`
