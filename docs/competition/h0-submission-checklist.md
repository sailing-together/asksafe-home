# H0 Submission Checklist

Source rules archive: `docs/competition/h0-official-rules-archive.md`
Source URL: https://h01.devpost.com/rules

This checklist converts the official H0 rules into the concrete items AskSafe
Home needs before submission. Use it as the working checklist for the final
submission package.

## Deadline

Official submission deadline:

- June 29, 2026, 5:00 PM Pacific Time
- Approximately June 30, 2026, 10:00 AM Australia/Sydney time

Team target:

- Finish product, production checks, and submission materials before the final
  morning in Sydney.
- Avoid last-minute DNS, hosting, or environment changes.

## Track

Recommended track:

- Track 4: Open Innovation

Rationale:

AskSafe Home is a safety decision workflow for older adults facing uncertain
calls, messages, video chats, payment requests, and online pressure. It is more
naturally an open innovation and impact project than a narrow ecommerce, B2B,
gaming, social, or entertainment app.

## Required Product Evidence

- [ ] Published Vercel production URL
- [ ] Public or accessible GitHub repository link
- [ ] Vercel Team ID
- [ ] AWS Database used: DynamoDB
- [ ] Screenshot proving AWS Database usage
- [ ] Architecture diagram showing frontend and backend components
- [ ] Product walkthrough video, under 3 minutes
- [ ] Text description explaining features and functionality
- [ ] Testing instructions for judges
- [ ] Confirmation that the product remains available for judging through the
      judging period

## Product Requirements Mapping

### Full-stack application

AskSafe Home should present itself as a full-stack product:

- Next.js App Router frontend on Vercel
- server API routes for analysis and outcome events
- DynamoDB as the primary backend database
- Bedrock-assisted explanation path behind server-side validation and quotas
- Terraform-managed AWS app infrastructure
- GitHub Actions Terraform workflow

### Required AWS Database

Database:

- Amazon DynamoDB

DynamoDB usage to explain:

- privacy-safe safety event metadata
- feedback outcome events
- trusted support action events
- user and household setup tables
- Bedrock quota counter items for cost hard stops

Important phrasing:

AskSafe stores privacy-safe metadata and outcome events by default. It does not
store raw sensitive situation text, passwords, one-time codes, full card
numbers, or trusted contact details.

### Required Vercel or v0 deployment

Deployment:

- Vercel production deployment
- v0 was used for rapid UI iteration and is documented in the repo

Submission language:

Use `product walkthrough`, `working product`, `production URL`, and `shippable
product` in our own materials. If Devpost uses the official term
`demonstration video`, that is acceptable in the form context.

## Video Requirements

Official constraints:

- under 3 minutes
- publicly visible on YouTube, Vimeo, or Youku
- shows the product functioning on the intended device
- explains which AWS Database is used
- does not include copyrighted music or third-party trademarks unless permitted

AskSafe video structure:

1. Problem: older adults face pressure and uncertainty during risky requests.
2. Product: AskSafe Home helps them pause, understand risk signals, and choose a
   safer next step.
3. Walkthrough: run a family money/video-call or bank-link scenario in the live
   product.
4. Backend: show DynamoDB-backed outcome events and Bedrock quota-safe AI assist.
5. Trust: explain privacy-safe metadata, trusted support, official help, and
   FinOps hard stops.
6. Close: AskSafe is a shippable safety decision workflow, not a generic chatbot
   or scam detector.

## Architecture Diagram Must Show

- User browser on mobile or desktop
- Vercel-hosted Next.js app
- v0-created UI foundation
- Next.js API routes
- deterministic safety rules engine
- optional Bedrock explanation assist
- Bedrock validation and safety invariant gate
- DynamoDB tables
- Terraform and GitHub Actions infrastructure path
- Vercel environment variables and scoped AWS runtime credentials
- FinOps controls: rate limits, message length cap, Bedrock quotas, AWS Budgets

## AWS Database Screenshot Ideas

Use screenshots that prove real DynamoDB usage without exposing sensitive data:

- DynamoDB table list showing `asksafe-home-prod-*` tables
- item view from `asksafe-home-prod-events` with synthetic safety event metadata
- item view from `asksafe-home-prod-feedback` with helpful/not-helpful metadata
- item view from `asksafe-home-prod-support-events` with consent action metadata
- item view from `asksafe-home-prod-events` showing quota counter item keys

Do not screenshot secrets, AWS access keys, raw user messages, real contact
details, billing account details, or unrelated AWS resources.

## Written Submission Points

The text description should emphasize:

- AskSafe is an AI-assisted safety decision companion for seniors.
- It helps users pause before acting on uncertain messages, calls, video chats,
  and payment requests.
- It explains risk signals, safer next steps, what to hold off on, and how to
  verify through trusted channels.
- Trusted support is user-initiated; nothing is shared automatically.
- DynamoDB stores privacy-safe metadata for product learning and outcome events.
- Bedrock is used as a bounded explanation assistant, not as the source of risk
  truth.
- The product includes cost and abuse guardrails before public exposure.

Avoid saying:

- AskSafe proves whether something is real or fake.
- AskSafe detects all scams.
- AskSafe monitors family members.
- AskSafe replaces emergency, government, legal, financial, or medical services.

## Testing Instructions For Judges

Provide:

- Production URL
- No login required for the core safety check
- Suggested scenario 1: family money request from a video call
- Suggested scenario 2: bank message with a link
- Suggested scenario 3: tech support caller asks to install an app or share a
  screen
- Note that setup and trusted support are optional and user-controlled
- Note that no real passwords, one-time codes, card numbers, or identity details
  should be entered

## Judging Criteria Alignment

### Technical Implementation

Evidence to highlight:

- DynamoDB data model and privacy-safe event tables
- Terraform-managed AWS infrastructure
- GitHub Actions infrastructure workflow
- Vercel production deployment
- Bedrock integration with validation and fallback
- rate limiting, input length caps, and quota hard stops
- smoke tests and production runbook evidence

### Design

Evidence to highlight:

- senior-friendly layout
- large readable text
- one task at a time
- calm colors and visual hierarchy
- voice input and read-aloud
- not a generic chatbot
- contextual official help and trusted support

### Impact And Real-World Applicability

Evidence to highlight:

- protects a real high-pressure moment before money, codes, links, app installs,
  or screen sharing
- supports independence and dignity for older adults
- lowers loneliness and decision pressure by enabling user-controlled trusted
  support
- can extend to banks, aged care, councils, community organizations, or family
  safety workflows

### Originality

Evidence to highlight:

- safety decision workflow rather than scam detector
- deterministic safety structure with bounded AI wording assistance
- trusted support without surveillance
- official help and verification steps built into the result flow
- FinOps-aware AI integration for shippable software

## Optional Bonus Content

Optional but valuable if time allows:

- public article or post explaining how AskSafe Home was built with DynamoDB,
  Vercel, v0, Bedrock, and Terraform
- must be public, not unlisted
- must say it was created for the purpose of entering the H0 Hackathon
- use `#H0Hackathon` when sharing on social media

Do this only if the required submission materials are already complete.
