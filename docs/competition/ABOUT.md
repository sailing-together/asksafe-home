# AskSafe Home Devpost About Copy

This file preserves the submitted Devpost "About the project" copy for the H0
submission.

## Inspiration

AskSafe Home was inspired by a simple problem: when an older adult receives an
uncertain message, call, video chat, or payment request, the hardest part is
often not technology itself. It is the pressure of deciding what to do next.

Many safety tools focus on detecting scams. We wanted to build something
narrower and more human: a calm safety decision workflow that helps seniors
pause, understand risk signals, and choose one safer next step before acting.

## What it does

AskSafe Home guides a user through one uncertain situation at a time. The user
can describe what happened by typing or voice, select what the other person is
asking them to do, and receive a clear result with:

- a safer next step
- what to hold off on
- risk signals that stood out
- why the situation is worth a pause
- safer verification steps
- official Australian help links
- optional trusted support

The product does not claim to prove whether something is real or fake. It helps
the user slow down, check through safer channels, and stay in control.

## How we built it

We built AskSafe Home as a full-stack web product using Next.js App Router,
TypeScript, React, Tailwind, shadcn/ui-style components, and Vercel.

We used v0.app for rapid UI exploration and iteration, then hardened the product
with server-side routes, DynamoDB persistence, Bedrock-assisted explanation,
validation and fallback logic, Terraform-managed AWS infrastructure, GitHub
Actions, and FinOps guardrails.

Amazon DynamoDB is the primary backend database for privacy-safe safety events,
feedback outcomes, trusted support actions, user setup, household setup, and
Bedrock quota counters.

Amazon Bedrock is used only as bounded explanation assistance. Deterministic
rules still own the safety structure, and Bedrock output is validated before
use.

We also prepared a visual architecture diagram showing the Vercel, Next.js,
DynamoDB, Bedrock, Terraform, GitHub Actions, and FinOps guardrail flow.

## Challenges

The biggest challenge was avoiding a generic chatbot or an overconfident "scam
detector." In high-pressure safety moments, vague AI answers can reduce trust.
We had to design a workflow that is calm, structured, and honest about
uncertainty.

We also had to balance AI usefulness with privacy and cost control. AskSafe uses
input limits, rate limits, quota checks, deterministic fallback, and FinOps hard
stops so the product can remain shippable and safer to operate.

## Accomplishments

We built a live product with:

- production Vercel deployment
- DynamoDB-backed event persistence
- Bedrock-assisted result wording
- trusted support flow
- official Australian help links
- voice input and read-aloud support
- Terraform and GitHub Actions infrastructure workflow
- production smoke checks
- architecture documentation and evidence pack

## What we learned

We learned that the strongest product direction is not "AI detects scams." It
is "AI-supported safety workflow." For seniors, the most valuable outcome is
often clarity: what to pause, what not to do yet, and how to verify safely.

## What's next

Next steps include deeper guided clarification, stronger trusted support
workflows, screenshot or image review, more official verification pathways, and
accessibility testing with older adults and community partners.
