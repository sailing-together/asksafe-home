# H0 Final Video Script

This file preserves the final narration script used for the AskSafe Home H0
product walkthrough video.

Final video:
[AskSafe Home product walkthrough](https://www.youtube.com/watch?v=mbEXnb-ODic)

Local production artifacts, such as the PPT and exported video file, are not
checked into the repository. The public YouTube link and this script are the
repository record.

## Script

```text
Scams increasingly exploit urgency, trust, fear, and isolation. Australian
Seniors research found that 84 percent of seniors had encountered or been
affected by scams, and 43 percent lacked confidence distinguishing real from
AI-generated voices in phone calls.

AskSafe Home is built for seniors in that moment of uncertainty. When a
message, call, video chat, or payment request feels unclear or pressured,
AskSafe helps them pause, understand risk signals, and choose a safer next step
before acting.

Here is the live product running in the browser. The flow starts with one simple
choice. Instead of opening a generic chatbot, AskSafe asks what kind of
situation feels uncertain. This keeps the first step clear, calm, and easy to
complete in a responsive web app for desktop and mobile browsers.

The user can type or use voice to describe what happened. AskSafe guides them
one step at a time and captures what the other person is asking them to do.

Here, the request involves money after a video call, so AskSafe asks for safer
context. The user can add more details, or choose the safer next step right away
if the situation already feels pressured.

AskSafe does not try to prove whether the request is real or fake. Instead, it
gives a pause-first result.

For this case, AskSafe recommends not sending money yet, and checking with the
family member using a saved number or account before acting.

The result shows the safer next step, risk signals, what to hold off on,
verification steps, official Australian help links, and optional trusted
support.

AskSafe Home runs on Vercel as a Next.js app, with the first UI foundation
rapidly explored in v0.app.

Amazon DynamoDB is the primary AWS database. It stores privacy-safe safety
events, feedback, trusted support actions, user setup, household setup, and
Bedrock quota counters.

Amazon Bedrock provides bounded explanation assistance, while deterministic
rules, validation, fallback behavior, rate limits, input caps, and FinOps quota
guardrails keep the workflow controlled and shippable.

AskSafe Home is not an emergency service, and it does not guarantee whether
something is real or fake.

Its goal is simple: help seniors pause first, check through safer channels, and
stay in control of the next step.

That is the product we wanted to ship: not a generic chatbot, but a calm safety
workflow for moments of uncertainty.
```
