# AskSafe Home Development Journey

This log records how AskSafe Home has evolved from a working UI preview into a
shippable safety decision workflow. It is intentionally written as a product and
engineering record, not a changelog of every commit.

For the detailed prompt-by-prompt v0.app build path, see
`docs/development/v0-iteration-log.md`.

## Product North Star

AskSafe Home exists to reduce uncertainty, loneliness, fear, and decision
pressure for older adults when a call, message, website, video chat, payment
request, or visitor leaves them unsure.

The team repeatedly chose workflow clarity over AI spectacle:

- help the user pause before acting
- identify what the other person wants them to do
- show the safer next step first
- explain risk signals in plain language
- provide official and trusted support paths
- keep the user in control of sharing

## Phase 0: Working Preview Before Backend

The first build was created in v0.app as a Next.js App Router preview using
TypeScript, React, Tailwind, and shadcn/ui-style components.

The early product decision was explicit:

- do not connect DynamoDB yet
- do not add Bedrock yet
- do not add authentication yet
- build a working senior-friendly UI first

This gave the team a real interaction to critique instead of debating abstract
architecture.

Initial preview screens:

- home screen
- "I feel unsure" guided flow
- situation type selection
- message or situation input
- deterministic mock result card
- trusted support action
- official help in Australia

Key design direction:

- warm off-white background
- deep green trust color
- orange shield accent
- large readable text
- one task at a time
- not a generic chatbot

## Phase 1: Interactive Local Safety Flow

The next step turned the UI into an interactive local flow without backend
integration.

Added:

- situation type selection
- message or situation textarea
- quick action chips such as pay money, click a link, share a code, give
  personal details, call back, install an app, share my screen, and not sure
- analyze button
- loading or thinking state
- deterministic local mock analysis

This proved the core product loop:

`unsure situation -> describe what happened -> identify requested action -> see safer next step`

## Phase 2: Senior-Friendly Product Polish

The team reviewed desktop and mobile screenshots closely and refined spacing,
hierarchy, and copy.

Important product corrections:

- video calls and online chat were added as a first-class situation type
- mobile spacing was tightened so screens felt less heavy
- result pages were made easier to scan
- official help was kept accessible because older adults need it easy to find
- footer language was made more trustworthy and less like a prototype
- "Built for H0 with Vercel and AWS" was removed from the public footer

The product position also sharpened:

AskSafe should not be described as a scam detector. It should be described as a
safety decision workflow.

## Phase 3: Trusted Support And Setup

The team added a trusted support concept while preserving user control.

Important choices:

- support setup is optional
- the user can use AskSafe without setting it up
- the user decides whether to share anything
- nothing is shared automatically
- support code does not share content by itself
- setup asks for email so AskSafe can remember the user later
- phone number remains optional
- mock one-time-code sign-in was added to make the flow feel shippable before
  real authentication is integrated

This supported a key product principle:

The family or trusted person loop must be consent-first, not monitoring-first.

## Phase 4: Practice Examples And Official Help

Practice examples were added to help users safely learn before a real incident.

Initial examples:

- bank message with a link
- urgent money request
- tech support call

The team later decided the practice section should be compact because it was
taking too much space on the home page.

Official help was included because it supports real-world action, especially in
Australia:

- Emergency 000
- Scamwatch
- IDCARE
- Australian Cyber Security Centre

The team debated whether official help belongs on the home page. The current
decision is to keep it easy to find, while keeping AskSafe's own role clear:

AskSafe is not an emergency service, government service, legal adviser,
financial adviser, or medical adviser.

## Phase 5: Voice Input And Read-Aloud

Voice input and read-aloud were added because some older adults may find typing
hard or may benefit from hearing the guidance.

The first version was too weak:

- voice stopped too quickly
- transcription felt slow
- copy such as "for this preview" made the product feel unfinished
- read-aloud had reliability issues

The team compared this with the earlier AskSafe v1 chat interaction and improved
the voice flow so it felt less like a fragile form add-on.

Current view:

- voice input is useful, but should not carry the product alone
- speech-to-text may lack punctuation
- the safety workflow still needs structured rules and eventually backend
  orchestration

## Phase 6: Guided Chat Versus Generic Chatbot

The team tested a chat-style step 2 flow. It made the screen feel more
conversational, but also exposed a product risk: weak repeated responses feel
unintelligent and reduce trust.

Important conclusion:

AskSafe should not become a generic chatbot.

The better direction is a guided safety workflow with structured follow-up:

- ask for the missing safety detail
- avoid repeating shallow confirmations
- identify what the other person wants the user to do
- transition to the result when enough context exists
- use rules and later AI assistance to improve explanation quality

This reinforced the architecture boundary:

Deterministic safety logic owns the safety structure. AI may assist wording or
explanation, but should not be the sole judge of truth or fraud.

## Phase 7: Trusted Scam Pattern Seeds

Trusted scam pattern seeds were imported into the rule logic so the analysis was
less arbitrary and more grounded.

The product moved from generic risk labels toward explicit signals:

- urgency or pressure
- payment request
- link clicking
- one-time code request
- app install
- screen sharing
- personal detail request
- unusual contact channel

This helped the result page explain why AskSafe is concerned instead of only
showing a risk score.

## Phase 8: Result Signals Workflow

The result page was improved to show clearer risk signals and official help
actions.

Key direction:

- lead with "what to do now"
- show "what not to do yet"
- explain the risk signals
- offer verification steps
- make official help clickable

This supports the main outcome metric:

The user should feel clearer about the next safe action.

## Phase 9: Cloud And AI Foundation Design

The team documented a cloud and AI foundation before adding runtime AWS code.

Important design choices:

- AWS is used for deployable backend proof, persistence, and auditability
- DynamoDB is the primary backend
- Bedrock is optional and server-side only
- Bedrock may polish explanations or interpret screenshots later
- Bedrock should not be the sole risk classifier
- raw sensitive user text should not be stored by default
- trusted support remains user-initiated

This design was aligned with the earlier H0 architecture work and moved into the
formal `asksafe-home` repo as product architecture.

## Infrastructure Code Milestones

The product journey and infrastructure readiness moved in parallel. The entries
below record code milestones, not completed AWS deployment.

### P3.1 AWS Bootstrap Foundation Code

P3.1 added the bootstrap infrastructure code needed before app resources can be
deployed safely.

Merged code scope:

- CloudFormation template for Terraform remote state
- S3 state bucket definition
- DynamoDB state lock table definition
- GitHub Actions OIDC provider definition
- limited Terraform deploy role definition
- Terraform backend example
- Terraform state/cache ignore rules

Deployment target recorded for later AWS setup:

- AWS account name: `AskSafe Home`
- AWS account ID: `893794041695`
- recommended region: `ap-southeast-2`
- recommended state bucket: `asksafe-home-tfstate-893794041695`
- recommended lock table: `asksafe-home-tflock`

The bootstrap layer is intentionally separate from app Terraform resources so
future app cleanup cannot destroy the state bucket, lock table, OIDC provider,
or Terraform role.

Status:

- code merged
- AWS deployment later completed through the CloudFormation bootstrap stack

At the time this code merged, still not done:

- the CloudFormation stack has not been deployed from this repo
- GitHub Actions has not yet been wired to run Terraform
- no app DynamoDB tables have been created in AWS

### P3.2 Terraform App Infrastructure Code

P3.2 added Terraform code for the first app-managed AWS resources.

Merged code scope:

- users table
- households table
- safety events table
- feedback table
- support events table
- server runtime IAM policy
- optional Bedrock model ARN input
- Terraform outputs for future Vercel runtime environment variables

This moves AskSafe Home closer to shippable cloud-backed software while keeping
the frontend working without AWS during local development.

Status:

- code merged
- Terraform apply later completed through GitHub Actions

At the time this code merged, still not done:

- Terraform has not yet been run through GitHub Actions
- Vercel runtime environment variables have not yet been connected
- Next.js server routes do not yet persist events to DynamoDB
- Bedrock runtime code is not yet integrated

### P3.3 GitHub Actions Terraform Workflow Code

P3.3 added the manual GitHub Actions workflow used to run Terraform from the
protected `aws-infra` GitHub environment.

Merged code scope:

- manual `plan`, `apply`, and `destroy` workflow actions
- OIDC-based AWS role assumption
- Terraform backend initialization from repository variables
- `terraform fmt`, `terraform validate`, and plan/apply steps
- explicit destroy confirmation guard

This created a safer operational path than running Terraform from a local
machine with long-lived AWS keys.

### P3.4 Terraform Backend Permission Fix

The first Terraform plan reached AWS successfully, which confirmed the GitHub
Actions OIDC trust path was working.

The first failure was during `terraform init`:

- Terraform needed to list S3 backend workspace prefixes
- the bootstrap role's S3 bucket list permission was too narrow
- AWS denied `s3:ListBucket`

Fix:

- expand the Terraform state bucket `s3:ListBucket` prefix condition to include
  backend workspace prefixes such as `env:`
- document that CloudFormation stack updates are required when the bootstrap
  template changes

After updating the CloudFormation stack, Terraform plan succeeded.

### P3.5 DynamoDB Apply Permission Fix

The first Terraform apply started creating the DynamoDB tables, then failed
during provider read-after-create checks.

The failure was:

- `dynamodb:DescribeContinuousBackups` was missing from the GitHub Actions
  Terraform role
- the AWS provider reads continuous backup status after table creation

Fix:

- add `dynamodb:DescribeContinuousBackups` to the app table management scope in
  the bootstrap role
- document provider read-after-create permissions in the infrastructure README

After updating the CloudFormation stack again, Terraform apply completed.

### P3.6 AWS Apply Run Record

The AWS infrastructure path is now operational.

Completed:

- CloudFormation bootstrap stack deployed
- GitHub repository variables configured
- GitHub repository secret `AWS_GITHUB_ACTIONS_ROLE_ARN` configured from the
  CloudFormation output
- GitHub Actions Terraform `plan` succeeded
- GitHub Actions Terraform `apply` succeeded

AWS resources now created:

- `asksafe-home-prod-users`
- `asksafe-home-prod-households`
- `asksafe-home-prod-events`
- `asksafe-home-prod-feedback`
- `asksafe-home-prod-support-events`
- `asksafe-home-prod-runtime-policy`

Important boundary:

This completes the infrastructure foundation, not backend product integration.
The Next.js app still needs server-side code to persist safety checks, support
events, and feedback to DynamoDB. Bedrock remains intentionally later, after the
data and safety boundaries are working.

## Runtime Integration Milestones

### P4.1 DynamoDB Runtime Client Foundation

P4.1 added the first server-side runtime foundation for writing AskSafe Home
metadata to DynamoDB from the Next.js app.

Merged code scope:

- AWS runtime environment validation for required table names
- server-only DynamoDB DocumentClient factory
- persistence helpers for safety events, feedback events, and support events
- tests proving safety event persistence excludes raw message text by default
- explicit package build-script approvals for transitive dependencies

Important boundary:

This phase created reusable persistence helpers. It did not yet expose an API
route, connect the frontend, add authentication, or call Bedrock.

### P4.2 Safety Event API Route

P4.2 added the first server API boundary between the frontend flow and DynamoDB
persistence.

Merged code scope:

- `POST /api/safety-events`
- server route helper for payload validation and response mapping
- API responses for successful writes, missing AWS config, invalid payloads, and
  write failures
- tests confirming raw message text is stripped or ignored before persistence

Important boundary:

The route accepts only sanitized safety metadata. It does not require or store
raw user message text, and it does not add Bedrock, login, feedback persistence,
or support-event UI integration.

### P4.3 Frontend Safety Event Persistence

P4.3 connected the completed local result flow to the safety event API.

Merged code scope:

- browser-safe safety event client helper
- sanitized payload builder for category, selected request types, risk level,
  risk signals, scam type ids, and source ids
- fire-and-forget API call after local analysis produces the result
- tests proving raw message text and result copy are not sent to persistence
- empty request selections normalized to `unsure`

Product value:

This completes the first end-to-end safety event loop:

`user describes situation -> local rules analyze -> result appears -> sanitized event metadata is persisted`

Important boundary:

Persistence failure must not block the user from seeing the safer next step. The
user-facing workflow remains local-rule-first, while DynamoDB records only
privacy-minimized metadata for later product learning and safety analytics.

Still not done after P4.3:

- Vercel production environment variables still need to be checked against
  Terraform outputs
- feedback and trusted support event UI flows are not yet wired to persistence
- Bedrock explanation assist remains intentionally later and should default off
- authentication remains mocked and should not be treated as production auth

### P4.3 Production Smoke Test

After configuring Vercel production environment variables and scoped AWS runtime
credentials, the production safety event API successfully wrote sanitized event
metadata to DynamoDB.

Smoke test result:

- endpoint: `POST https://asksafe-home.vercel.app/api/safety-events`
- status: `201`
- event id: `861bd0da-ce4d-42a9-bc76-6df065ae4aad`
- payload: sanitized metadata only, no raw message text

This proves the current competition deployment can write safety event metadata
from Vercel to AWS DynamoDB. It does not prove feedback persistence, trusted
support persistence, production authentication, or Bedrock integration.

The current Vercel-to-AWS credential path uses a tightly scoped IAM access key
for competition speed. After the competition, the team should rotate or delete
that key and reassess production hosting, preferably moving to AWS-native
runtime roles if AskSafe is hosted primarily on AWS.

### P4.5 Feedback And Support Event Persistence

P4.5 wired the existing feedback and trusted support persistence helpers into
the user-facing flow.

Merged code scope:

- `POST /api/feedback-events`
- `POST /api/support-events`
- browser-safe outcome event client helper
- a compact "Was this helpful?" result-page prompt
- support event recording for opening support setup, creating a support code,
  and copying a shareable safety summary
- tests proving raw message text and trusted contact details are ignored before
  persistence

Product value:

This starts capturing whether AskSafe is actually helping users feel clearer,
without making the senior complete a long survey. It also records trusted
support actions only when the user actively chooses them.

Important boundary:

These events are metadata-only and fire-and-forget. They do not store raw
situation text, trusted contact details, or automatic family alerts. They also
do not add Bedrock or production authentication.

Production smoke test finding:

The first production smoke test reached `/api/feedback-events` and
`/api/support-events`, but DynamoDB returned write failures. The root cause was
that feedback and support event items did not include the table-specific primary
keys `feedbackId` and `supportEventId`. A follow-up fix adds those keys and
regression tests.

Production verification after fix:

After the key-mapping fix was merged and redeployed, production smoke tests for
`/api/feedback-events` and `/api/support-events` both returned `201` with
generated ids. P4.5 feedback and trusted support event persistence is now
production-verified for metadata-only writes.

Still not done after P4.5 follow-up:

- production authentication
- trusted support dashboard
- Bedrock explanation assist

## Product Ideas Recorded For Later

### Trusted Phrase

The team identified a strong future feature for video scams, AI voice scams, and
urgent family-money requests: a trusted phrase.

Working name:

- Trusted Phrase
- Family Safety Phrase
- AskSafe check phrase

Purpose:

Give the user a simple verification step when someone claims to be family or a
trusted person and asks for money, codes, app installs, screen sharing, or urgent
action.

Important boundary:

The trusted phrase is a risk-reduction step, not proof that something is safe.

Suggested result guidance:

> Do not rely on the face or voice alone. Ask your trusted phrase, then contact
> them back using a saved number.

### Independent Senior Check-In

The team discussed a possible check-in feature for older adults living alone.

The safer product framing is not surveillance. It should be a low-pressure
wellbeing check-in that the older adult chooses to share with trusted people.

This remains a later idea because AskSafe Home's current core is the safety
decision workflow.

## Current Direction

The next useful work should continue to follow the product architecture:

1. Check Vercel runtime environment variables against the Terraform outputs.
2. Smoke test feedback and trusted support event persistence after the next
   production redeploy.
3. Keep raw sensitive text minimised by default.
4. Add Bedrock explanation assist only after deterministic rules remain stable,
   with FinOps controls and a default-off flag.
5. Keep improving the guided workflow so it reduces uncertainty instead of
   feeling like a shallow chatbot.

The team should keep asking:

> How does this reduce uncertainty, loneliness, fear, or decision pressure for
> seniors?
