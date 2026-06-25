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

## Phase 8.5: Scenario-Specific Safer Next Steps

The team reviewed a product issue where high-risk results could feel too generic.
For example, a family money request should not only say "stop here". It should
also tell the user how to verify safely without relying on the suspicious
channel.

Decision:

- deterministic rules still own the safety structure;
- result copy may use a rule-specific safer next step when a clear signal exists;
- family money requests should tell the user to pause before paying and contact
  the person through a number or account they already trust;
- generic hard-stop advice still applies when the rule does not have a safer
  contextual next step.

This improves the workflow without making Bedrock responsible for risk
classification or identity verification.

## Phase 8.6: Trusted Phrase Guidance

The team discussed whether AskSafe should support a family or trusted-person
phrase for video, voice, and message-based impersonation scenarios.

Decision for the current product slice:

- include trusted phrase guidance as a verification step for family money
  requests;
- do not create a stored phrase, key, password, or account setup flow yet;
- do not ask users to type the phrase or answer into AskSafe;
- make clear that a face, voice, or message alone is not enough to verify an
  urgent money request;
- tell users to contact the person back through a saved number or account they
  already trust.

This reduces decision pressure without pretending that AskSafe can prove who is
on a video call or message thread.

## Phase 8.7: Guided Clarification Quality Pass

P7.7 tightened the Step 2 guided conversation for family-money scenarios.

Decision:

- avoid repeating the same generic acknowledgement after the user adds more
  detail;
- after a family-money clarification, guide the user toward a trusted callback
  and a family-only question;
- keep hard-stop scenarios direct so code, remote access, personal detail, app
  install, and screen-share requests still move quickly to the safer next step;
- keep low-risk appointment-style contexts calm and generic;
- do not turn Step 2 into an open-ended chatbot.

This improves the feeling that AskSafe is helping the user think through the
next safe action while preserving the deterministic workflow and existing
submission contract.

## Phase 8.8: Family Money Result Copy Quality

P7.8 improved result-page copy for family-money and video-call requests.

Decision:

- keep the high-risk safety posture for urgent family-money requests;
- make the headline and explanation more specific to money requests from someone
  close to the user;
- avoid generic scam wording when the safer framing is "pause and verify through
  another trusted channel";
- preserve the same risk structure, safer step, verification steps, and result
  card UI.

This helps the result feel more like contextual decision support and less like a
blunt scam detector.

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

### P5.0 Bedrock AI Orchestration And FinOps Guardrails

P5.0 documented how AskSafe Home should add Bedrock without weakening the
existing safety workflow or creating avoidable cloud cost.

Design scope:

- Bedrock is optional and default-off
- deterministic rules remain the source of risk level, required warnings, and
  verification steps
- Bedrock may assist senior-friendly wording, trusted-support summaries, or
  future structured image observations
- raw sensitive text, passwords, one-time codes, full card numbers, and identity
  details should not be sent to Bedrock by default
- server-side code must validate Bedrock output and fall back to deterministic
  results on timeout, invalid JSON, missing config, or runtime errors
- FinOps controls should include model allowlists, short payloads, token limits,
  timeouts, budget alerts, and no per-keystroke or interim voice calls

This keeps AskSafe Home aligned with the product promise: AI can make guidance
clearer, but the product remains a controlled safety decision workflow, not a
generic chatbot or black-box scam detector.

Still not done after P5.0:

- Bedrock runtime helper code
- redaction helper implementation
- `/api/analyze` Bedrock integration
- production Bedrock environment variables
- Bedrock smoke test evidence

### P5.1 Bedrock Runtime Foundation

P5.1 added the first runtime foundation for Bedrock without enabling real model
calls in production.

Merged code scope:

- server-side Bedrock environment parsing
- default-off configuration behavior
- bounded input, output-token, and timeout settings
- redaction helper for common sensitive values before future model calls
- optional explanation-assist helper that falls back when disabled, missing an
  invoker, or when invocation fails
- tests proving disabled mode does not call Bedrock and runtime failures do not
  block the safety flow

Important boundary:

This phase does not add the AWS Bedrock SDK client, does not call Bedrock from
production, and does not change the user-facing result flow. It prepares the
server-side safety and FinOps boundaries for a later opt-in integration.

Still not done after P5.1:

- strict JSON response validation
- safety invariant validation for model output
- `/api/analyze` Bedrock integration
- production Bedrock environment variables and smoke test evidence

### P5.2 Bedrock Client Wrapper

P5.2 added the server-side Bedrock Runtime client wrapper while keeping Bedrock
default-off and disconnected from the user-facing flow.

Merged code scope:

- AWS SDK Bedrock Runtime dependency
- `invokeBedrockExplanationModel`
- Claude Messages request body with bounded max output tokens
- AbortController plus timeout race so slow model calls fail fast
- timeout-specific error and outer explanation outcome mapping
- tests for request construction, timeout, and fallback classification

Important boundary:

This phase does not connect Bedrock to the frontend, result page, or production
analyze route. It does not let Bedrock set risk level or required warnings.
Future integration must still validate JSON and safety invariants before
applying any model-assisted copy changes.

Still not done after P5.2:

- `/api/analyze` Bedrock integration
- production Bedrock environment variables and smoke test evidence

### P5.3 Bedrock Response Validation

P5.3 added the safety gate for model-assisted explanation output.

Merged code scope:

- Bedrock explanation response validator
- strict JSON parsing with fallback on invalid JSON
- allowlist for model-editable fields only
- length limits for safer next step, why, verification steps, and trusted
  support summary
- rejection of unsupported fields such as model-supplied risk level
- safety-invariant checks that reject output weakening rule-derived warnings
- `invalid_response` outcome mapping in the Bedrock explanation helper
- tests for valid output, invalid JSON, invalid shape, oversized copy, safety
  weakening, and helper fallback behavior

Important boundary:

This phase does not call Bedrock from the frontend, result page, or production
analyze route. It also does not apply model wording to the user-facing result.
It only ensures future model wording must pass a narrow server-side validation
gate before it can be considered safe to use.

Still not done after P5.3:

- production Bedrock environment variables and smoke test evidence

### P5.4 Bedrock Analyze Integration

P5.4 added the server-side analyze integration point for optional Bedrock
explanation assist.

Merged code scope:

- `handleAnalyzeRequest` server handler
- `/api/analyze` POST route
- deterministic analysis remains the first step
- Bedrock explanation assist runs only through the existing default-off runtime
  controls
- successful validated model wording can replace only `saferStep`, `why`, and
  `verify`
- rule-derived risk level, headline, warnings, risk signals, scam type ids, and
  source ids are preserved
- invalid payloads return `400`
- invalid, disabled, timeout, missing config, or runtime-error Bedrock outcomes
  fall back to the deterministic result
- route-level rate limiting uses the existing in-memory baseline
- tests for disabled mode, valid model wording, invalid model output fallback,
  and invalid payloads

Important boundary:

This phase creates the server analyze path, but the browser UI still uses the
existing local analysis flow. No production Bedrock environment variables are
required while `ENABLE_BEDROCK_EXPLANATION` remains off.

Still not done after P5.4:

- production Bedrock environment variables and smoke test evidence

### P5.5 Frontend Analyze API Client

P5.5 switched the browser safety check to use the server analyze path while
keeping the deterministic local analyzer as a fallback.

Merged code scope:

- `analyzeSafetyWithFallback` frontend client helper
- `POST /api/analyze` call from the result flow
- local deterministic fallback when the API fails, throws, returns non-OK, or
  returns malformed data
- client-side timeout fallback so the thinking state does not wait indefinitely
- safety event recording continues after the final result is chosen
- tests for API success, API failure fallback, thrown fetch fallback, slow API
  fallback, and malformed response fallback

Important boundary:

The UI still does not display Bedrock technical metadata. Users only see the
safety result. With `ENABLE_BEDROCK_EXPLANATION=false`, production behavior
should remain deterministic apart from the analysis now travelling through the
server route first.

Still not done after P5.5:

- production Bedrock environment variables and smoke test evidence

### P6.0 Vercel Production Readiness Review

P6.0 adapted Vercel's production checklist to AskSafe Home's current
competition-stage deployment.

Review scope:

- operational excellence
- security
- reliability
- performance
- cost optimization
- plan-dependent or enterprise-only items

Key findings:

- GitHub to Vercel production deployment works
- production API routes have DynamoDB smoke-test evidence
- Vercel Analytics is enabled
- lockfile is committed
- Bedrock remains default-off
- gaps remain around incident response, security headers, rate limiting, build
  config hardening, spend alerts, and documented Vercel dashboard settings

This phase is a readiness audit only. It does not change runtime behavior.

### P6.1 Incident And Rollback Runbook

P6.1 added a production incident and rollback runbook for the current Vercel +
AWS deployment.

Runbook scope:

- incident severity classification
- team roles and communication cadence
- Vercel instant rollback
- GitHub revert and redeploy
- runtime feature flag disablement
- AWS credential disablement or rotation
- DynamoDB degraded-write triage
- Bedrock disablement guidance
- post-fix smoke tests
- post-incident review notes
- privacy boundaries for incident handling

This phase is docs-only and does not change runtime behavior.

### P6.2 Security Headers Baseline

P6.2 added a baseline set of security headers to the Vercel/Next.js deployment.

Merged code scope:

- global Next.js `headers()` configuration
- HSTS, content-type, referrer, frame, and permissions headers
- CSP in report-only mode to avoid breaking production behavior before
  observation
- a config test that verifies the header baseline
- production readiness documentation updates

Important boundary:

This phase does not add API rate limiting, does not enforce CSP yet, and does
not change app behavior or AWS infrastructure.

### P6.3 API Rate Limiting Baseline

P6.3 added a lightweight rate-limit baseline for the event API routes.

Merged code scope:

- in-memory server-side rate limiter
- client key extraction from forwarded request headers
- `429` responses with `Retry-After` for limited requests
- protection for safety, feedback, and support event API routes before payload
  parsing
- tests for request limits, client isolation, and forwarded IP handling
- production readiness documentation updates

Important boundary:

This is a competition-stage baseline, not a long-term distributed rate-limit
solution. Before broader public launch, AskSafe should replace or augment it
with Vercel WAF, KV-backed rate limiting, or AWS-native edge controls.

### P6.4 Build Config Hardening

P6.4 hardened the Next.js build configuration before judging.

Merged code scope:

- removed `typescript.ignoreBuildErrors`
- added config tests proving TypeScript build errors are no longer ignored
- kept `images.unoptimized=true` for the current static local asset setup
- documented that image optimization should be revisited after asset cleanup
- production readiness documentation updates

Important boundary:

This phase does not change app UI, API behavior, AWS infrastructure, CSP
enforcement, or rate-limit strategy. It only tightens build failure behavior and
records the current image optimization decision.

### P6.5 Launch Settings Evidence Log

P6.5 added a launch settings evidence log for production readiness checks that
live outside the codebase.

Documented scope:

- production deployment identifiers
- Vercel runtime environment variable names
- GitHub repository variables and secrets used by Terraform
- AWS account, region, and cost-control checkpoints
- Vercel plan, spend, deployment protection, WAF, log drain, and team access
  checkpoints
- code-level controls already present in the repo
- final pre-judging confirmation checklist

Important boundary:

The evidence log records setting names and confirmation status only. It must not
store secret values, access keys, one-time codes, passwords, or private contact
details.

### P5.6 Production Bedrock Analyze Smoke Path

P5.6 added a controlled production smoke-test path for the Bedrock-assisted
analyze route.

Merged code scope:

- synthetic Bedrock analyze smoke payload
- response evaluator for `/api/analyze`
- smoke CLI:
  `pnpm smoke:bedrock:analyze https://asksafe-home.vercel.app --expect-bedrock`
- tests that distinguish:
  - healthy deterministic analyze response
  - expected Bedrock success
  - Bedrock not actually used when it was expected
  - malformed analyze response
- production smoke-test documentation

Important boundary:

This does not add a new public Bedrock-specific endpoint. It uses the existing
server analyze route so the same rate limit, validation, deterministic rule
baseline, Bedrock validation, and fallback behavior are exercised.

Still not done after P5.6:

- enable the production Bedrock environment variables only after model access,
  IAM runtime permission, and budget controls are confirmed
- record the actual production smoke-test result after deployment

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
