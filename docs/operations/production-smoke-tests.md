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
