# Production Smoke Tests

This document records production smoke tests for AskSafe Home. These tests prove specific runtime paths work; they are not broad product or security certification.

## 2026-06-19: Safety Event API Writes To DynamoDB

### Purpose

Verify that the deployed Vercel production API can write sanitized safety event metadata to the AWS DynamoDB events table.

### Environment

- App: AskSafe Home
- Vercel project: `asksafe-home`
- Production URL: `https://asksafe-home.vercel.app`
- Endpoint: `POST /api/safety-events`
- AWS region: `ap-southeast-2`
- DynamoDB table: `asksafe-home-prod-events`

### Runtime Configuration Checked

Vercel production runtime environment variables were configured:

- `AWS_REGION=ap-southeast-2`
- `ASKSAFE_EVENTS_TABLE=asksafe-home-prod-events`
- `ASKSAFE_FEEDBACK_TABLE=asksafe-home-prod-feedback`
- `ASKSAFE_SUPPORT_EVENTS_TABLE=asksafe-home-prod-support-events`
- `ASKSAFE_USERS_TABLE=asksafe-home-prod-users`
- `ASKSAFE_HOUSEHOLDS_TABLE=asksafe-home-prod-households`

Vercel production also received sensitive AWS runtime credentials for the temporary competition deployment path:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The IAM user is intended to have no console access and only the scoped AskSafe runtime policy.

### Sanitized Test Payload Shape

The smoke test used sanitized metadata only:

```json
{
  "category": "message",
  "requests": ["link"],
  "result": {
    "risk": "caution",
    "riskSignals": [
      {
        "id": "link-request",
        "label": "asking you to use a link",
        "severity": "caution"
      }
    ],
    "scamTypeIds": ["smoke-test"],
    "sourceIds": ["manual-smoke-test"]
  },
  "anonymousSessionId": "smoke-test"
}
```

No raw user message text was sent.

### Result

The first browser GET check returned `405`, which was expected because the endpoint only supports POST.

Before Vercel redeploy, the API returned:

```text
STATUS=202
{"skipped":true,"reason":"missing-aws-config"}
```

After Vercel redeploy with table environment variables, the API returned:

```text
STATUS=500
{"ok":false,"reason":"write-failed"}
```

This proved the environment variables were visible but AWS runtime credentials were still missing.

After adding scoped AWS runtime credentials to Vercel production and redeploying, the API returned:

```text
STATUS=201
{"ok":true,"id":"861bd0da-ce4d-42a9-bc76-6df065ae4aad"}
```

### What This Proves

- The deployed Vercel API route is reachable in production.
- The route accepts the sanitized safety event payload.
- Vercel production can see required AskSafe runtime environment variables.
- Vercel production can authenticate to AWS for the current competition runtime path.
- DynamoDB accepted a sanitized safety event write.

### What This Does Not Prove

- It does not prove feedback persistence works yet.
- It does not prove trusted support event persistence works yet.
- It does not prove authentication is production-ready.
- It does not prove Bedrock integration.
- It does not prove raw sensitive text can be safely stored; raw text remains out of scope by default.

### Follow-Up

- After P4.5 is merged and redeployed, smoke test `POST /api/feedback-events`.
- After P4.5 is merged and redeployed, smoke test `POST /api/support-events`.
- Keep the Vercel AWS access key tightly scoped and stored as sensitive.
- Rotate or delete the Vercel AWS access key after the competition.
- Reassess hosting after the competition; prefer AWS-native runtime roles if AskSafe moves off Vercel.


## P4.5 Feedback And Support Event Smoke Test

Date: 2026-06-19
Branch tested after merge: `main`
Production URL: `https://asksafe-home.vercel.app`

### Requests

- `POST /api/feedback-events`
- `POST /api/support-events`

### Result Before Fix

Both endpoints were reachable in production, but both returned:

```json
{"ok":false,"reason":"write-failed"}
```

This proved:

- the Vercel deployment included the new P4.5 routes
- request parsing accepted clean JSON payloads
- DynamoDB write failed after route handling

Root cause:

- the feedback table hash key is `feedbackId`
- the support events table hash key is `supportEventId`
- the persistence item builder was writing only a generic `eventId`
- the safety event table had worked earlier because its hash key is `eventId`

Fix:

- feedback events now write `feedbackId` as the item primary key
- support events now write `supportEventId` as the item primary key
- the related safety event id is stored as `eventId` for table indexes
- regression tests cover both item shapes

### Result After Fix

After the key-mapping fix was merged and Vercel redeployed, both endpoints wrote
successfully to DynamoDB.

Feedback event:

- endpoint: `POST /api/feedback-events`
- status: `201`
- id: `8401895a-f1ce-4f58-8962-8159af45b487`

Support event:

- endpoint: `POST /api/support-events`
- status: `201`
- id: `80669834-737b-4d9d-a8ee-d577460a5f4a`

This verifies P4.5 production persistence for feedback and trusted support
metadata.

## P5.6 Bedrock Analyze Route Smoke Test

Date: to be run after P5.6 is merged and production is redeployed
Production URL: `https://asksafe-home.vercel.app`
Endpoint: `POST /api/analyze`

### Purpose

Verify that the deployed production analyze route can exercise the optional
Bedrock explanation path without adding a separate public Bedrock endpoint.

This smoke test uses a synthetic scenario only:

```json
{
  "message": "A video caller claiming to be my daughter asked me to send 2000 AUD today.",
  "category": "video",
  "requests": ["pay"]
}
```

No real user message, phone number, email address, one-time code, password, or
private contact detail should be used.

### Required Production Runtime Settings

Before expecting Bedrock to be used, confirm these production settings:

- `ENABLE_BEDROCK_EXPLANATION=true`
- `BEDROCK_MODEL_ID=au.anthropic.claude-haiku-4-5-20251001-v1:0`
- `BEDROCK_MAX_INPUT_CHARS` is bounded
- `BEDROCK_MAX_OUTPUT_TOKENS` is bounded
- `BEDROCK_TIMEOUT_MS` is bounded
- AWS runtime credentials can invoke only the approved Bedrock model in the
  chosen region
- budget alerts and spend controls are in place

Terraform runtime policy allowlist:

```json
[
  "arn:aws:bedrock:ap-southeast-2:893794041695:inference-profile/au.anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:ap-southeast-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:ap-southeast-4::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
]
```

Claude Haiku 4.5 is invoked through the AU system-defined inference profile,
which routes to Sydney (`ap-southeast-2`) and Melbourne (`ap-southeast-4`).

### Command

Run the basic route-health smoke test:

```bash
pnpm smoke:bedrock:analyze https://asksafe-home.vercel.app
```

Run the Bedrock-enabled smoke test:

```bash
pnpm smoke:bedrock:analyze https://asksafe-home.vercel.app --expect-bedrock
```

### Passing Result

The Bedrock-enabled command should print JSON like:

```json
{
  "ok": true,
  "endpoint": "https://asksafe-home.vercel.app/api/analyze",
  "expectBedrock": true,
  "bedrockUsed": true,
  "bedrockOutcome": "success",
  "risk": "high"
}
```

### Recorded Production Result

2026-06-20 production smoke passed after enabling the AU Claude Haiku 4.5
inference profile and bounded response validation:

```json
{
  "endpoint": "https://asksafe-home.vercel.app/api/analyze",
  "expectBedrock": true,
  "ok": true,
  "bedrockUsed": true,
  "bedrockOutcome": "success",
  "risk": "high"
}
```

This used only the synthetic smoke payload above. No real user message, phone
number, email address, one-time code, password, or private contact detail was
used.

2026-06-25 production smoke passed again after P7.3 strengthened Bedrock
response safety validation:

```json
{
  "endpoint": "https://asksafe-home.vercel.app/api/analyze",
  "expectBedrock": true,
  "ok": true,
  "bedrockUsed": true,
  "bedrockOutcome": "success",
  "risk": "high"
}
```

This confirms the production route still uses the optional Bedrock explanation
assist successfully after adding stricter response safety checks.

## Guided Clarification Manual Check

Use this synthetic scenario to confirm the result can show one clarification
question without collecting sensitive details:

```json
{
  "message": "my daughter asks me for money",
  "category": "video",
  "requests": ["pay"]
}
```

Expected:

- risk remains `high`;
- the result includes a `clarification` object;
- the clarification asks the user to verify through a trusted channel;
- the clarification does not ask for bank details, one-time codes, passwords,
  or identity documents.

### Failure Results To Investigate

- `http-error`: the production route is not accepting the request
- `malformed-response`: the route response no longer matches the expected
  analyze shape
- `unexpected-risk`: deterministic safety structure changed unexpectedly
- `bedrock-not-used`: Bedrock was expected but the route returned a fallback
  outcome such as `disabled`, `missing-model-id`, `runtime_error`, `timeout`, or
  `invalid_response`
- `request-failed`: local network or DNS request failure

### What This Proves

- The production analyze route is reachable.
- The deterministic safety baseline still classifies the synthetic scenario as
  high risk.
- When `--expect-bedrock` passes, the optional Bedrock explanation assist was
  invoked successfully and returned validated output.
- The route still returns only structured result data to the client, not raw
  Bedrock prompts or completions.

### What This Does Not Prove

- It does not prove Bedrock should be enabled for all public users.
- It does not prove screenshots, audio, video, or deepfake detection.
- It does not prove the model can decide whether a caller is real.
- It does not replace budget monitoring, rate limiting, or incident rollback
  procedures.

## P7.2 Step 2 Guided Clarification Manual Check

Date: to be run after P7.2 is merged and production is redeployed
Production URL: `https://asksafe-home.vercel.app`

### Purpose

Verify that Step 2 asks one useful clarification question for thin risky
context without becoming a repetitive chatbot.

### Test Scenario 1: Thin Family Money Request

1. Open AskSafe Home.
2. Choose `Video call or online chat`.
3. Type or speak:

   ```text
   my daughter asked me for money
   ```

4. Send details.

Expected:

- AskSafe shows one assistant clarification:

  ```text
  Before you decide, check one thing: how did they contact you, and how do they want the money sent?
  ```

- The helper text says:

  ```text
  You can answer this, or choose the safer next step now.
  ```

- `Show me the safer next step` remains available.

### Test Scenario 2: Clarification Answer Does Not Loop

Continue from scenario 1 and send:

```text
video call, she said she needs 2000 AUD
```

Expected:

- AskSafe does not ask another clarification question.
- AskSafe says:

  ```text
  Thank you. I have enough to show the safer next step.
  ```

### Test Scenario 3: Hard-Stop Code Request

1. Start a new check.
2. Choose `A text or email`.
3. Select `Share a code`.
4. Type:

   ```text
   they asked me for my one-time code
   ```

Expected:

- AskSafe does not ask a clarification question.
- AskSafe says:

  ```text
  I have enough to show the safer next step.
  ```

### Test Scenario 4: Low-Risk Reminder

1. Start a new check.
2. Choose `A text or email`.
3. Type:

   ```text
   my dentist reminder says my appointment is tomorrow
   ```

Expected:

- AskSafe does not ask a clarification question.
- AskSafe says:

  ```text
  Thank you. I have enough to show the safer next step.
  ```

### What This Proves

- Step 2 uses the deterministic P7.1 clarification signal.
- AskSafe asks no more than one clarification question per check.
- Hard-stop cases skip extra conversation.
- Voice-entered text and typed text share the same Step 2 behavior after the
  text is inserted into the composer.

### What This Does Not Prove

- It does not prove AskSafe can verify whether a caller or video participant is real.
- It does not prove screenshot, image, audio, or deepfake detection.
- It does not prove Bedrock should generate follow-up questions.

## P7.33 Final Production Smoke Pass

Date: 2026-06-27
Branch tested after merge: `main`
Production URL: `https://asksafe-home.vercel.app`

### Purpose

Verify the release-facing production runtime after the product walkthrough and
release readiness documentation updates. This check confirms the deployed app can
still reach the Bedrock-backed analyze path and persist privacy-safe outcome
events to DynamoDB.

### Bedrock Analyze Smoke

Command:

```bash
node --no-warnings --experimental-strip-types scripts/smoke-bedrock-analyze.ts https://asksafe-home.vercel.app --expect-bedrock
```

Result:

```json
{
  "endpoint": "https://asksafe-home.vercel.app/api/analyze",
  "expectBedrock": true,
  "ok": true,
  "bedrockUsed": true,
  "bedrockOutcome": "success",
  "risk": "high"
}
```

### Outcome Event Persistence Smoke

Command:

```bash
node --no-warnings --experimental-strip-types scripts/smoke-outcome-events.ts https://asksafe-home.vercel.app
```

Result:

```json
{
  "baseUrl": "https://asksafe-home.vercel.app",
  "safety": {
    "endpoint": "https://asksafe-home.vercel.app/api/safety-events",
    "ok": true,
    "persisted": true,
    "id": "6b338041-4a96-4b13-a6f7-d63c5d0f2d9d"
  },
  "feedback": {
    "endpoint": "https://asksafe-home.vercel.app/api/feedback-events",
    "ok": true,
    "persisted": true,
    "id": "b35e0602-d424-4c12-9183-8e0edef68f9a"
  },
  "support": {
    "endpoint": "https://asksafe-home.vercel.app/api/support-events",
    "ok": true,
    "persisted": true,
    "id": "4249223d-212d-43ee-a8b4-9e1688f79e63"
  }
}
```

### What This Proves

- The production `/api/analyze` route is reachable.
- Bedrock explanation assist is enabled and returns validated output for the
  synthetic high-risk scenario.
- Safety, feedback, and support event endpoints can persist privacy-safe records
  to DynamoDB.
- The release-facing production URL is exercising the expected AWS runtime path.

### What This Does Not Prove

- It does not prove AskSafe can identify whether a person in a video, voice
  call, image, or message is real.
- It does not replace browser-level product walkthrough checks.
- It does not replace security, cost, or operational monitoring for a broader
  public launch.
