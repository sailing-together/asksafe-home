# H0 Final Release Smoke Record

Production URL: `https://asksafe-home.vercel.app`
Submission deadline: June 29, 2026, 5:00 PM Pacific Time
Sydney equivalent: approximately June 30, 2026, 10:00 AM Australia/Sydney time

Use this document for the final pre-submission release record. Fill in actual
results only after each check is run.

## Final Submission Links

- Production URL: `https://asksafe-home.vercel.app`
- GitHub repository: `https://github.com/sailing-together/asksafe-home`
- Product walkthrough video: `TBD`
- Devpost submission URL: `TBD`
- Architecture diagram: `docs/assets/architecture/asksafe-home-architecture.svg`
- DynamoDB evidence screenshot: `TBD`
- Vercel Team ID: `TBD`

## Required Evidence Status

- [x] Product remains available on Vercel production URL.
- [x] GitHub repository link is accessible.
- [ ] Product walkthrough video is public and under 3 minutes.
- [x] Architecture diagram is attached or linked.
- [ ] DynamoDB usage screenshot is captured.
- [ ] AWS database field is set to DynamoDB.
- [ ] Vercel Team ID is entered.
- [ ] Testing instructions are included.
- [ ] Submission copy avoids unsupported detection claims.

## Production Browser Checks

Record the final result:

| Check | Result | Notes |
| --- | --- | --- |
| Home page loads | Passed | `curl -I` returned HTTP/2 200 from production URL. |
| Core safety flow starts without login | TBD | |
| Situation selection works | TBD | |
| Text input works | TBD | |
| Voice input works if browser allows it | TBD | |
| Result page renders | TBD | |
| Read aloud works if browser allows it | TBD | |
| Trusted support setup opens | TBD | |
| Official help links are clickable | TBD | |
| Feedback buttons work | TBD | |
| Mobile viewport is usable | TBD | |

## Production Smoke Commands

Run from the project root when ready:

```bash
npm run smoke:outcome:production
npm run smoke:bedrock:production
```

Optional local verification:

```bash
npm run test
npm run typecheck
npm run build
```

Quota smoke:

```bash
npm run smoke:bedrock:quota
```

Only run the quota smoke with a temporary low quota or a clearly controlled
quota subject. Do not intentionally consume unnecessary Bedrock tokens during
submission preparation.

## Smoke Results

### Outcome Events Smoke

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
    "id": "ba83b3a3-8d26-41bc-aea7-ec3e94170a08"
  },
  "feedback": {
    "endpoint": "https://asksafe-home.vercel.app/api/feedback-events",
    "ok": true,
    "persisted": true,
    "id": "18924d6d-c702-4118-9754-5c248e891450"
  },
  "support": {
    "endpoint": "https://asksafe-home.vercel.app/api/support-events",
    "ok": true,
    "persisted": true,
    "id": "afc15362-8411-42f4-9a36-41824f04a43d"
  }
}
```

Notes:

```text
Direct Node command completed successfully. The deployed Vercel API routes can
write synthetic safety, feedback, and support events to DynamoDB.
```

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

Notes:

```text
Direct Node command completed successfully. Production analysis used Bedrock and
returned a validated high-risk result.
```

### Bedrock Quota Smoke

Command:

```bash
npm run smoke:bedrock:quota
```

Result:

```text
TBD
```

Notes:

```text
Only run if cost impact is controlled.
```

## Vercel Deployment Check

- Latest production deployment URL: `https://asksafe-home.vercel.app`
- Deployment status: `Production URL returned HTTP/2 200`
- Build status: `TBD`
- TypeScript/build status: `TBD`
- Runtime API status: `Outcome event and Bedrock analyze smoke checks passed`
- Notes: `TBD`

## GitHub Actions Check

- Latest app checks: `TBD`
- Latest Terraform workflow: `TBD`
- Required checks green or documented: `TBD`
- Notes: `TBD`

## AWS Evidence Check

DynamoDB:

- [ ] `asksafe-home-prod-events`
- [ ] `asksafe-home-prod-feedback`
- [ ] `asksafe-home-prod-support-events`
- [ ] `asksafe-home-prod-users`
- [ ] `asksafe-home-prod-households`
- [ ] Bedrock quota counter items

Bedrock:

- Inference profile ID:
  `au.anthropic.claude-haiku-4-5-20251001-v1:0`
- Region: `ap-southeast-2`
- Production behavior: `Bedrock analyze smoke used Bedrock successfully with outcome success`

FinOps:

- [ ] AWS Budget exists.
- [ ] Bedrock quota env vars exist.
- [ ] Rate limiting is enabled.
- [ ] Input caps are enabled.
- [ ] Cost hard-stop behavior is documented.

## Final Scenario To Record

Recommended scenario:

```text
My daughter asks me to send 2000 AUD after a video call.
```

Expected product behavior:

- AskSafe should not claim to prove whether the caller is real.
- AskSafe should recommend pausing before sending money.
- AskSafe should show risk signals.
- AskSafe should tell the user not to send money yet.
- AskSafe should suggest verifying through a known trusted channel.
- AskSafe should offer user-controlled trusted support.

## Submission Risk Review

Before final submit:

- [ ] No secrets are visible in screenshots or video.
- [ ] No real personal data is used in the walkthrough.
- [ ] No unsupported product claims are made.
- [ ] No "demo" or "prototype" wording appears in our own public description.
- [ ] The production URL works from a clean session.
- [ ] The video is under 3 minutes.
- [ ] DynamoDB is clearly explained as the primary AWS database.
- [ ] AskSafe is positioned as a safety decision workflow, not a universal scam
      detector.

## Final Sign-Off

Fill this in before submission:

```text
Final production check completed by:
Date/time:
Submission owner:
Known limitations:
Decision:
```
