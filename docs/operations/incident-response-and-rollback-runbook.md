# Incident Response And Rollback Runbook

This runbook is the operating procedure for the current AskSafe Home production
deployment. It is intentionally practical for the competition-stage stack:
Vercel for the web app, GitHub for source control and deployment triggers, and
AWS in `ap-southeast-2` for DynamoDB-backed metadata persistence.

AskSafe's incident rule is simple:

> Reduce uncertainty, loneliness, fear, and decision pressure for seniors first.

If a technical decision makes the product less safe, less clear, or harder to
trust during an incident, choose the simpler safer path and document the
follow-up.

## Current Production Shape

- Production URL: `https://asksafe-home.vercel.app`
- Vercel project: `asksafe-home`
- Production source branch: `main`
- Deployment behavior: merges to `main` deploy automatically through Vercel
- Runtime AWS region: `ap-southeast-2`
- Safety event API: `POST /api/safety-events`
- Feedback event API: `POST /api/feedback-events`
- Support event API: `POST /api/support-events`
- Bedrock explanation assist: default-off

Current DynamoDB tables:

- `asksafe-home-prod-events`
- `asksafe-home-prod-feedback`
- `asksafe-home-prod-support-events`
- `asksafe-home-prod-users`
- `asksafe-home-prod-households`

Current competition runtime credential path:

- Vercel stores scoped AWS runtime credentials as sensitive environment
  variables.
- The runtime key should be rotated or deleted after the competition if AskSafe
  moves to a different hosting model or AWS-native runtime roles.

## Severity Levels

### Sev1: Safety Or Privacy Critical

Examples:

- AskSafe shows guidance that could directly increase user risk.
- Raw sensitive user text is accidentally logged, stored, or exposed.
- An AWS runtime key, Vercel secret, or GitHub secret may be exposed.
- Production is serving the wrong app or a malicious page.

Target response:

- Start triage immediately.
- Stop the unsafe path first.
- Roll back or disable the affected capability before deep debugging.
- Record actions and timestamps.

### Sev2: Production Flow Degraded

Examples:

- The safety check flow is broken.
- Result generation fails for normal inputs.
- Event APIs return errors while the UI still works.
- Vercel deployment succeeds but production behavior is clearly wrong.

Target response:

- Triage within the same working session.
- Roll back if user-facing safety flow is affected.
- Keep the user-facing safer-next-step flow working even if analytics or
  persistence is degraded.

### Sev3: Non-Critical Defect

Examples:

- Copy, spacing, or non-blocking UI issue.
- Documentation issue.
- Practice example wording issue.

Target response:

- Fix through normal branch and PR flow.
- Do not rush a production hotfix unless the issue changes user safety,
  privacy, or judging readiness.

## Incident Roles

One person may cover multiple roles during a small-team incident.

- Incident lead: decides rollback or disablement path.
- Engineering lead: investigates code, deployment, API, and AWS behavior.
- Communications lead: keeps team updates concise and calm.
- Recorder: captures timeline, commands, links, screenshots, and outcome.

For Sev1 and Sev2, post a status update every 15 to 30 minutes until the issue
is contained.

Suggested update format:

```text
Status:
Impact:
Current action:
Next check:
Owner:
```

## Immediate Triage Checklist

1. Identify what is broken or risky.
2. Decide whether this is Sev1, Sev2, or Sev3.
3. Check whether the production UI still lets users reach a safer next step.
4. Check the latest Vercel deployment and commit.
5. Check whether the issue started after the latest merge to `main`.
6. For API issues, test the affected endpoint with sanitized payloads only.
7. For secret or credential concerns, disable or rotate first, then investigate.

Do not paste real user messages, passwords, one-time codes, full card numbers,
identity details, or private contact details into GitHub, chat, screenshots, or
test logs.

## Rollback Option 1: Vercel Instant Rollback

Use this when the latest production deployment is bad and a previous production
deployment is known to be good.

Steps:

1. Open the Vercel `asksafe-home` project.
2. Go to Deployments.
3. Find the last known good production deployment.
4. Use Instant Rollback.
5. Confirm `https://asksafe-home.vercel.app` serves the previous version.
6. Run production smoke tests.
7. Record the deployment URL, time, and reason.

Use this for fast containment. Create a follow-up GitHub PR afterward so `main`
matches the intended production state.

## Rollback Option 2: GitHub Revert And Redeploy

Use this when the bad change is already merged to `main` and the cleanest path is
to revert it in source control.

Steps:

1. Identify the merge commit or commits that introduced the issue.
2. Create a revert branch.
3. Revert the bad commit or PR.
4. Run local checks.
5. Open a PR with a clear incident note.
6. Merge after review.
7. Confirm Vercel production redeploys from `main`.
8. Run production smoke tests.

This is slower than Instant Rollback but leaves a cleaner repository history.

## Rollback Option 3: Disable Runtime Feature Flag

Use this when the issue is isolated to optional runtime behavior.

Current important flag:

- `ENABLE_BEDROCK_EXPLANATION=false`

If Bedrock explanation assist causes latency, cost, invalid output, or confusing
copy:

1. Set `ENABLE_BEDROCK_EXPLANATION=false` in Vercel production environment
   variables.
2. Redeploy production if Vercel requires a redeploy for the env change.
3. Confirm deterministic result guidance still works.
4. Review logs and costs before re-enabling.

Do not re-enable an optional AI path without a PR, tests, and a smoke test.

## AWS Runtime Credential Incident

Treat suspected credential exposure as Sev1.

Steps:

1. Disable or delete the exposed IAM access key in AWS IAM.
2. Remove the old values from Vercel environment variables.
3. Create a replacement key only if production still needs it.
4. Update Vercel sensitive environment variables.
5. Redeploy production.
6. Run API smoke tests with sanitized payloads.
7. Review CloudTrail or AWS console activity for unexpected use.
8. Record the rotation time and follow-up actions.

After the competition, prefer moving away from long-lived Vercel runtime keys if
AskSafe is hosted primarily on AWS.

## DynamoDB Degraded Write Triage

The user-facing safety result must not depend on event persistence.

If an API route returns a degraded response or a write failure:

1. Confirm whether the UI still shows the safer next step.
2. Check Vercel environment variables for table names and AWS region.
3. Check whether the runtime IAM policy includes the affected table.
4. Check the API response:
   - `201`: write succeeded
   - `202`: missing AWS configuration or graceful degradation
   - `400`: invalid request payload
   - `500`: write failure or unexpected server error
5. Check the table primary key mapping in persistence helpers.
6. Fix through PR unless user-facing safety guidance is affected.

Do not add raw message text to debug payloads.

## Bedrock Incident Rules

Bedrock is an assistive explanation layer, not the source of truth for safety
decisions.

If Bedrock is enabled later and causes a problem:

1. Disable it with `ENABLE_BEDROCK_EXPLANATION=false`.
2. Confirm deterministic rules still produce the result.
3. Check whether redaction ran before invocation.
4. Check timeout and token settings.
5. Check whether output validation rejected unsafe or malformed output.
6. Review cost impact before re-enabling.

Never let Bedrock override:

- required warnings
- risk level structure
- "what not to do yet"
- official verification guidance
- sensitive data minimisation

## Production Smoke Tests After Fix Or Rollback

Run the smoke test checklist in
`docs/operations/production-smoke-tests.md`.

Minimum checks:

1. Home page loads.
2. A user can start the safety check.
3. A user can enter a sanitized example situation.
4. Result page shows a safer next step.
5. Official help links still open expected destinations.
6. Safety event API returns the expected status for a sanitized payload.
7. Feedback and support event APIs return expected statuses if they were
   affected.

Record:

- date and time
- branch or deployment
- endpoint tested
- response status
- sanitized payload summary
- result

## Privacy Boundaries During Incidents

Do not collect or share:

- passwords
- one-time codes
- full card numbers
- bank account details
- identity document details
- raw private scam messages
- trusted contact private details

Use sanitized examples such as:

```json
{
  "category": "text",
  "riskLevel": "high",
  "selectedRequestTypes": ["click_link", "personal_details"],
  "riskSignalIds": ["link_click", "personal_details"]
}
```

## Post-Incident Review

After containment, write a short review.

Include:

- what happened
- user impact
- timeline
- root cause
- rollback or fix used
- smoke-test evidence
- what worked
- what needs improvement
- follow-up tasks

Keep the review blameless and focused on making AskSafe safer and clearer.

## Known Follow-Up Gaps

The production readiness review still identified gaps that this runbook does not
solve by itself:

- tighten Content Security Policy from report-only to enforced when production
  behavior is understood
- replace the in-memory API rate-limit baseline with durable edge or
  distributed controls before broader public launch
- keep TypeScript build-error enforcement enabled
- revisit `images.unoptimized` after asset cleanup
- document Vercel spend alerts
- document Vercel deployment protection decision
- document team access roles
- rotate or remove the temporary Vercel AWS runtime key after the competition
