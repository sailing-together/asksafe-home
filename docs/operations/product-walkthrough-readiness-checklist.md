# Product Walkthrough Readiness Checklist

Use this checklist before recording the AskSafe Home product walkthrough video or presenting the
production app to judges.

## Production Walkthrough Environment

- Production app: `https://asksafe-home.vercel.app`
- Production branch: `main`
- Vercel project: `asksafe-home`
- AWS region: `ap-southeast-2`
- Bedrock model profile: `au.anthropic.claude-haiku-4-5-20251001-v1:0`

## Evidence Already Recorded

- Release validation scenario definitions: `docs/operations/release-validation-scenarios-checklist.md`
- Release validation scenario production run: `docs/operations/release-scenario-run-log.md`
- Production smoke tests: `docs/operations/production-smoke-tests.md`
- Vercel readiness review: `docs/operations/vercel-production-readiness.md`
- Launch settings evidence: `docs/operations/launch-settings-evidence.md`
- Incident response and rollback: `docs/operations/incident-response-and-rollback-runbook.md`

## Before Recording

Check these items on the day of recording:

- Production URL opens successfully on desktop.
- Production URL opens successfully on mobile.
- Home screen shows the primary "I feel unsure" path clearly.
- AskSafe Home logo or title can be used to return to the home screen.
- "My setup" opens without blocking the core safety flow.
- No real personal details, passwords, card numbers, one-time codes, or identity
  details are entered during recording.
- Browser microphone permission is ready if voice input will be shown.
- Browser sound is ready if read-aloud will be shown.
- Keep one backup browser tab open with the production URL already loaded.

## Product Walkthrough Flow To Record

Recommended order:

1. Open the home screen and explain that AskSafe Home is a safety decision
   workflow for moments of uncertainty.
2. Start the "I feel unsure" flow.
3. Choose "Video call or online chat".
4. Enter the daughter video call money request scenario:

   ```text
   My daughter asked me on a video call to send 2000 AUD today.
   ```

5. Select "Pay money".
6. Submit the check.
7. Show the result page:
   - safer next step first
   - risk signals
   - what not to do yet
   - how to check it is real
   - trusted support option
   - official help links
8. Explain that the product does not claim to prove whether the video is real.
   It helps the user pause, avoid acting under pressure, and verify another way.
9. Return home and briefly show one normal low-risk scenario if time allows.

## Release Validation Scenarios To Keep Ready

Use synthetic examples only.

### Daughter Video Call Asking For Money

- Expected risk: `high`
- Best for main story.
- Explain: "pause and verify through a saved trusted channel."

### Bank Message With A Link

- Expected risk: `high`
- Good for showing official verification steps.
- If Bedrock fallback is mentioned, explain: "AI wording is bounded by safety
  invariants, and deterministic safety rules remain the baseline."

### One-Time Code Request

- Expected risk: `high`
- Good for showing a hard-stop case.
- Do not enter a real one-time code.

### Tech Support Screen Sharing

- Expected risk: `high`
- Good for showing remote-access and install-an-app risk.

### Normal Appointment Reminder

- Expected risk: `low`
- Good for showing AskSafe can stay calm and avoid over-warning.

## How To Explain Bedrock

Suggested wording:

```text
AskSafe uses deterministic safety rules as the baseline. Bedrock helps generate
clearer wording, but the result is checked before it is shown. If the AI output
does not match the safety rules, AskSafe falls back to the safer deterministic
result.
```

Avoid saying:

- "AskSafe can prove this is real or fake."
- "The AI knows this is a scam."
- "You should always report this as fraud."

Use instead:

- "This has risk signals."
- "Pause before acting."
- "Verify through a channel you already trust."
- "You can involve someone you trust if you choose."

## Manual UI Pass

Before recording, check:

- The selected category appears in the guided flow.
- Text input works.
- Voice input does not block typed input.
- Read-aloud works in the target browser, or is skipped without disrupting the
  product walkthrough.
- Result page can be reached from typed input.
- Risk signals are visible on the result page.
- Official help links are clickable.
- Trusted support flow opens.
- Feedback buttons do not distract from the main story.
- "Check something else" returns to a new safety check.

## Production Smoke Commands

Run these only if production changed after the latest recorded evidence:

```bash
pnpm smoke:bedrock:analyze https://asksafe-home.vercel.app --expect-bedrock
node --no-warnings --experimental-strip-types scripts/smoke-outcome-events.ts https://asksafe-home.vercel.app
```

Expected:

- Bedrock analyze smoke returns `bedrockUsed: true` and `bedrockOutcome:
  "success"`.
- Outcome event smoke returns persisted event IDs for safety, feedback, and
  support.

## If Something Fails During Recording

- If the UI feels slow, pause and wait rather than clicking repeatedly.
- If Bedrock is unavailable, continue with deterministic fallback and explain
  that the safety baseline still works.
- If voice input is unreliable, type the scenario instead.
- If read-aloud is unreliable, skip it and continue the result walkthrough.
- If production is down, use Vercel rollback or a known-good deployment from the
  incident response runbook.

## Final Reminder

The product walkthrough should show that AskSafe Home reduces uncertainty, fear, and decision
pressure. Keep the story focused on helping the user pause and choose a safer
next step.
