# H0 Architecture Evidence Checklist

Use this checklist to create or review the final AskSafe Home architecture
diagram for the H0 submission.

The diagram should look like a real shipped product architecture, not a generic
AI app sketch. Use recognizable product icons where possible.

## Recommended Diagram Style

- Use official or familiar icons for major platforms.
- Keep the diagram to one page.
- Show left-to-right data flow from user to Vercel to AWS.
- Separate runtime flow from delivery/infrastructure flow.
- Use short labels and avoid paragraphs inside nodes.
- Keep sensitive data out of the diagram.

## Icon And Component Map

| Diagram Item | Recommended Icon / Visual Cue | Label |
| --- | --- | --- |
| Senior user | User/person icon | Senior user |
| Browser / mobile | Browser or mobile icon | Desktop/mobile browser |
| Vercel | Vercel triangle icon | Vercel deployment |
| Next.js | Next.js icon | Next.js App Router |
| React UI | React icon or component icon | AskSafe Home UI |
| v0.app | v0 wordmark, v0 app icon, or small source badge | v0 UI foundation |
| API routes | Serverless function icon | Next.js API routes |
| Safety rules | Shield/checklist icon | Deterministic safety rules |
| Bedrock | AWS Bedrock icon | Amazon Bedrock |
| Bedrock validation | Shield/gate icon | Validation and fallback |
| DynamoDB | AWS DynamoDB icon | Amazon DynamoDB |
| IAM role | AWS IAM / key icon | Scoped runtime role |
| AWS Budget | Cost/budget icon | AWS Budget |
| FinOps | Coin + shield, meter + shield, or simple custom cost-control icon | FinOps guardrails |
| Quota controls | Gauge/stop icon | Bedrock quota hard stop |
| Terraform | Terraform icon | Terraform |
| GitHub Actions | GitHub Actions icon | CI/CD workflow |
| Vercel environment | Lock/config icon | Vercel environment variables |
| Smoke tests | Checkmark/test icon | Production smoke checks |

If official icons are not available in the drawing tool, use simple consistent
line icons with text labels.

For FinOps, a custom icon is acceptable if no official icon is available. Use a
simple coin or dollar symbol combined with a shield, stop sign, or gauge. The
visual message should be cost control, not generic finance.

For v0.app, use the v0 app icon or wordmark if available. If not, use a small
`v0.app` label badge next to the UI foundation node.

## Runtime Flow To Show

The main runtime path should show:

1. Senior user opens AskSafe Home in a browser.
2. Browser loads the Vercel-hosted Next.js app.
3. User submits a safety check through the UI.
4. Next.js API route receives the request.
5. Deterministic safety rules create the structured safety baseline.
6. Optional Bedrock assistance generates clearer explanation wording.
7. Bedrock output goes through validation and safety invariant checks.
8. API returns the result to the UI.
9. Privacy-safe event metadata is written to DynamoDB.
10. Feedback and trusted support actions are also written to DynamoDB.

## Data Stores To Show

Show DynamoDB as the primary AWS database with these logical tables:

- `asksafe-home-prod-events`
- `asksafe-home-prod-feedback`
- `asksafe-home-prod-support-events`
- `asksafe-home-prod-users`
- `asksafe-home-prod-households`
- Bedrock quota counter items

Do not show raw sensitive message storage as a core design claim. The product
position is privacy-safe workflow metadata and outcome events.

## AI Boundary To Show

The Bedrock section should make the boundary clear:

- Bedrock is optional assistance, not the source of truth.
- deterministic rules still provide the safety baseline.
- Bedrock output is validated before use.
- deterministic fallback exists if Bedrock is unavailable, invalid, or blocked
  by quota.

Recommended label:

```text
Bounded Bedrock assistance
validated before use
```

Avoid labels like:

- AI scam detector
- deepfake detector
- verifies identity
- proves real or fake

## FinOps And Abuse Controls To Show

Show cost and abuse controls near the API/Bedrock path:

- input length cap
- rate limiting
- user tier quota
- Bedrock daily hard stop
- AWS Budget

Recommended label:

```text
FinOps guardrails
rate limit + input cap + quota hard stop
```

This is important because the product has a public URL and Bedrock calls can
create cost if abused.

## Infrastructure Flow To Show

Add a separate lower band for delivery and infrastructure:

1. GitHub repository
2. GitHub Actions
3. Terraform
4. AWS infrastructure
5. Vercel production deployment

Show that Terraform manages AWS-side infrastructure, not Vercel UI layout.

Recommended labels:

- `GitHub Actions Terraform workflow`
- `Terraform-managed AWS resources`
- `Vercel production deployment`

## Security And Privacy Notes To Include

Add a small note box:

```text
Privacy-safe metadata by default.
Do not enter passwords, one-time codes, full card numbers, or identity details.
```

Optional second note:

```text
Trusted support is user-controlled. Nothing is shared automatically.
```

## Diagram Layout Recommendation

Use this layout:

```text
[Senior user]
     |
[Browser / mobile]
     |
[Vercel: Next.js App Router + AskSafe UI]
     |
[Next.js API routes]
     |
     +--> [Deterministic safety rules]
     |
     +--> [Bounded Bedrock assistance] --> [Validation + fallback]
     |
     +--> [DynamoDB privacy-safe events]

Lower band:
[GitHub] --> [GitHub Actions] --> [Terraform] --> [AWS resources]
```

For a more polished diagram, use grouped boxes:

- Experience layer
- Application layer
- Safety and AI layer
- Data layer
- Infrastructure and operations layer

## Submission Review Checklist

Before using the architecture diagram in the final submission, confirm:

- [ ] Vercel and Next.js are visible.
- [ ] v0 is shown as UI foundation, not the whole backend.
- [ ] DynamoDB is clearly shown as the AWS database.
- [ ] Bedrock is shown as bounded assistance with validation/fallback.
- [ ] deterministic safety rules are visible.
- [ ] outcome events and support events connect to DynamoDB.
- [ ] Terraform and GitHub Actions are visible.
- [ ] FinOps controls are visible.
- [ ] no secrets, account IDs, or real personal data appear.
- [ ] the diagram does not claim deepfake detection or identity verification.
- [ ] the diagram matches the current product implementation.
