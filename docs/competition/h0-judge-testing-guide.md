# H0 Judge Testing Guide

Production URL: `https://asksafe-home.vercel.app`

This guide gives judges a quick, safe way to test AskSafe Home without entering
real personal or financial information.

## Quick Test Path

Estimated time: 5 minutes.

1. Open the production URL.
2. Select **I feel unsure about something**.
3. Choose a situation type.
4. Enter one of the synthetic scenarios below.
5. Select any matching request chips, such as **Pay money**, **Click a link**,
   **Share a code**, **Install an app**, or **Share my screen**.
6. Submit the check.
7. Review the result page.
8. Optionally open **My setup** or trusted support to see the user-controlled
   support flow.

## Important Safety Note

Please use synthetic information only.

Do not enter:

- real passwords
- one-time codes
- full card numbers
- identity document details
- real phone numbers or email addresses
- private family or financial details

AskSafe Home is designed to minimize sensitive data collection. It stores
privacy-safe workflow metadata and outcome events rather than raw sensitive
messages.

## Scenario 1: Family Money Request

Use this scenario:

```text
My daughter asks me to send 2000 AUD after a video call.
```

Suggested request chip:

- Pay money

Expected result:

- AskSafe should recommend pausing before sending money.
- It should not claim to prove whether the caller is real.
- It should highlight risk signals around money, urgency, and a close contact.
- It should suggest verifying through a trusted channel before acting.
- It should offer trusted support controlled by the user.

## Scenario 2: Bank Message With A Link

Use this scenario:

```text
I received a text saying my bank account will close unless I tap a link and
confirm my details today.
```

Suggested request chips:

- Click a link
- Give personal details

Expected result:

- AskSafe should recommend not tapping the link.
- It should explain that pressure, account closure threats, links, and personal
  detail requests are risk signals.
- It should suggest using a known official channel, such as the bank's app,
  official website, or card-back phone number.

## Scenario 3: Tech Support Call

Use this scenario:

```text
Someone called and said my computer has a problem. They want me to install an
app and share my screen.
```

Suggested request chips:

- Install an app
- Share my screen

Expected result:

- AskSafe should recommend stopping before installing anything.
- It should warn against screen sharing or remote access requested by an
  unexpected caller.
- It should suggest ending the call and contacting a trusted source separately.

## Scenario 4: Lower-Information Request

Use this scenario:

```text
Someone asked me to do something and I am not sure.
```

Suggested request chip:

- Not sure

Expected result:

- AskSafe should avoid overclaiming.
- It should ask for or encourage more detail when needed.
- It should still give cautious next steps that reduce pressure and avoid risky
  action.

## What To Look For

AskSafe Home should feel like a safety workflow, not a generic chatbot.

Look for:

- large readable text
- calm visual design
- one task at a time
- clear safer next step
- risk signals explained in plain language
- practical verification steps
- official help when relevant
- trusted support that is optional and user-controlled
- no claim that AI can prove whether a message, caller, or video is real

## Backend Evidence

The production product includes:

- DynamoDB-backed safety, feedback, support, setup, and quota events
- Bedrock-assisted explanation behind validation and deterministic fallback
- rate limits, input caps, and Bedrock quota hard stops
- Terraform-managed AWS infrastructure and GitHub Actions workflow

The core safety check can be tested without creating an account.

## Known Product Boundaries

AskSafe Home is not:

- an emergency service
- a government service
- a legal, financial, medical, or identity recovery adviser
- a universal scam detector
- a tool that proves whether a video, voice, caller, or message is real
- a family monitoring or surveillance product

AskSafe Home helps users pause, understand risk signals, and choose a safer next
step.
