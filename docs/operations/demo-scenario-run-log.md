# Demo Scenario Run Log

Date: 2026-06-26
Production URL: https://asksafe-home.vercel.app
Source checklist: docs/operations/demo-scenarios-checklist.md

## Summary

This run checked the five demo scenarios against the production `/api/analyze`
endpoint before demo recording.

- 5 of 5 scenarios returned the expected risk level.
- 4 scenarios returned `high` risk as expected.
- 1 scenario returned `low` risk as expected.
- Bedrock was used successfully for 4 scenarios.
- 1 scenario used the deterministic rule-based fallback after Bedrock output was
  rejected by the safety invariant check.
- Synthetic test data only. No real user, account, identity, or payment details
  were used.

## Scenario Results

### 1. Daughter Video Call Asking For Money

Input:

```text
My daughter asked me on a video call to send 2000 AUD today.
```

Expected risk: `high`
Actual risk: `high`
Pass: yes
Bedrock outcome: `success`

Observed headline:

```text
Pause before sending money.
```

Observed safer next step:

```text
Pause before paying. Contact your daughter using a phone number or account you already know and trust, not the one from this video call.
```

Observed risk signals:

- `family-money-request`
- `payment-request`
- `video-call`
- `urgency`

Observed follow-up:

- `clarificationNeeded: true`

Notes:

This scenario shows the core AskSafe Home story: pause, avoid accusing the family
member, and verify through a trusted saved channel.

### 2. Bank Message With A Link

Input:

```text
I received a text saying my bank account will be closed unless I tap a link and confirm my details today.
```

Expected risk: `high`
Actual risk: `high`
Pass: yes
Bedrock outcome: `invalid_response`
Bedrock invalid detail: `uses_suspicious_contact_channel`

Observed headline:

```text
This looks unsafe. It's good you paused.
```

Observed safer next step:

```text
Pause before paying or transferring money. Verify the request through a trusted channel first.
```

Observed risk signals:

- `payment-request`
- `link-request`
- `personal-details`
- `urgency`

Observed first not-yet action:

```text
Don't send any money, gift cards, or bank details
```

Notes:

This is an expected safety-path result. The Bedrock output was rejected by the
invariant check, and the API returned the deterministic fallback result instead
of exposing unsafe or inconsistent AI output.

### 3. One-Time Code Request

Input:

```text
Someone said they accidentally sent a code to my phone and asked me to read it back.
```

Expected risk: `high`
Actual risk: `high`
Pass: yes
Bedrock outcome: `success`

Observed headline:

```text
This looks unsafe. It's good you paused.
```

Observed safer next step:

```text
Stop here for now. Don't reply, pay, or share anything. Take a breath, then talk it through with someone you trust before doing anything else.
```

Observed risk signals:

- `code-request`

Observed follow-up:

- `clarificationNeeded: false`

Notes:

This remains a hard-stop case. The result warns without asking for extra detail
first.

### 4. Tech Support Screen Sharing

Input:

```text
A caller said my computer has been hacked and asked me to install an app and share my screen.
```

Expected risk: `high`
Actual risk: `high`
Pass: yes
Bedrock outcome: `success`

Observed headline:

```text
This looks unsafe. It's good you paused.
```

Observed safer next step:

```text
Do not install remote access tools from a caller or pop-up. Close the message or page if safe to do so. Contact official support through a trusted website or ask a trusted person.
```

Observed risk signals:

- `remote-access`
- `payment-request`

Observed first not-yet action:

```text
Don't send any money, gift cards, or bank details
```

Notes:

This scenario confirms the remote-access pathway is recognised and produces a
clear stop-and-verify next step.

### 5. Normal Appointment Reminder

Input:

```text
My dentist reminder says my appointment is tomorrow at 10am.
```

Expected risk: `low`
Actual risk: `low`
Pass: yes
Bedrock outcome: `success`

Observed headline:

```text
Nothing here looks alarming.
```

Observed safer next step:

```text
This seems okay from what you've shared. If anything still feels off to you, trust that feeling and check with someone before acting.
```

Observed risk signals:

- none

Observed first not-yet action:

```text
Don't share more than you need to
```

Notes:

This scenario confirms AskSafe Home can stay calm for a normal reminder and does
not invent risk signals.

## Verification Command

The production endpoint was checked with synthetic requests equivalent to the
scenario checklist:

```bash
POST https://asksafe-home.vercel.app/api/analyze
```

This is an API-level production validation. A browser-level manual pass is still
needed before recording final demo footage.
