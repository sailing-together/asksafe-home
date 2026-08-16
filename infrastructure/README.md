# AskSafe Home Infrastructure

This folder contains the AWS bootstrap and Terraform app infrastructure entry
point for AskSafe Home.

## Scope

This folder is split into two layers.

Bootstrap resources are created once with CloudFormation:

- S3 bucket for Terraform remote state
- DynamoDB table for Terraform state locking
- GitHub Actions OIDC provider
- Limited GitHub Actions role for Terraform

App resources are managed with Terraform:

- DynamoDB application tables
- optional Amazon SES sender identity for setup emails
- runtime IAM policy for server-side app access
- Terraform outputs for Vercel runtime configuration

This folder does not create:

- Next.js API routes
- Vercel secrets
- direct browser access to AWS
- Bedrock runtime code
- SMS delivery or phone OTP

Do not use v0.app, Vercel, or generated application code to manage these
admin-level bootstrap resources.

## Bootstrap Once With CloudFormation

Deploy `cloudformation/terraform-bootstrap.yml` once from a secured AWS
administrator session.

Recommended stack settings:

- Stack name: `asksafe-home-terraform-bootstrap`
- Region: `ap-southeast-2`
- State bucket: `asksafe-home-tfstate-<aws-account-id>`
- Lock table: `asksafe-home-tflock`
- GitHub org: `sailing-together`
- GitHub repo: `asksafe-home`
- GitHub environment: `aws-infra`
- Terraform state key: `asksafe-home/prod/terraform.tfstate`
- App project name: `asksafe-home`
- App environment: `prod`
- Setup email from address: leave blank unless Terraform needs to manage a
  specific Amazon SES sender identity

The S3 bucket and DynamoDB lock table are retained on stack deletion. Delete
them manually only after every Terraform state file has been backed up or is no
longer needed.

If this bootstrap template changes, update the CloudFormation stack before
rerunning Terraform in GitHub Actions. Terraform's S3 backend lists state
workspace prefixes during `terraform init`.

The GitHub Actions Terraform role also needs read-after-create permissions used
by AWS providers, such as DynamoDB continuous backup status checks during apply.
When SES setup email delivery is enabled, update this bootstrap stack with the
same `SetupEmailFromAddress` used by Terraform before running Terraform apply.
The Terraform role is scoped to that single SES identity.

## Configure GitHub

In the `sailing-together/asksafe-home` repository:

1. Create environment `aws-infra`.
2. Add required reviewers before allowing `apply` or `destroy`.

Repository variables for later Terraform workflow:

- `AWS_REGION=ap-southeast-2`
- `TF_STATE_BUCKET=<stack output bucket>`
- `TF_STATE_KEY=asksafe-home/prod/terraform.tfstate`
- `TF_LOCK_TABLE=<stack output lock table>`
- `TF_PROJECT_NAME=asksafe-home`
- `TF_ENVIRONMENT=prod`

Repository secret:

- `AWS_GITHUB_ACTIONS_ROLE_ARN`

## AWS Account Safety Checklist

- Enable MFA on the AWS root account.
- Confirm the root account has no access keys.
- Enable MFA on the admin IAM user used for bootstrap.
- Configure AWS Budgets alerts before using Bedrock or creating app resources.
- Request Bedrock model access only after bootstrap is working.
- Delete or rotate any temporary local bootstrap credentials after OIDC works.

## Cleanup Boundary

The normal app Terraform workflow may later destroy app resources only. It must
not destroy the state bucket, lock table, OIDC provider, or Terraform role.

## App Terraform Resources

The Terraform project under `terraform/` manages the first deployable AWS app
resources:

- `${project_name}-${environment}-users`
- `${project_name}-${environment}-households`
- `${project_name}-${environment}-events`
- `${project_name}-${environment}-feedback`
- `${project_name}-${environment}-support-events`
- `${project_name}-${environment}-runtime-policy`

Default names use `project_name=asksafe-home` and `environment=prod`.

The DynamoDB tables use pay-per-request billing and server-side encryption.
Event-like tables enable TTL through an `expiresAt` item attribute so the app can
avoid keeping safety-check records longer than needed.

Terraform outputs include suggested Vercel environment variable names for the
future server-side runtime.

## Optional Setup Email Delivery With Amazon SES

AskSafe's core safety check does not require sign-in. The optional `My setup`
flow can send one-time setup codes through Amazon SES when this app stack is
configured with a verified sender identity.

Start with a single sender email identity to avoid introducing DNS requirements
before product validation:

```hcl
enable_setup_email_ses  = true
setup_email_from_address = "noreply@example.com"
```

After Terraform creates the SES identity, verify the sender email in the AWS SES
console before setting production Vercel variables. Unverified SES identities
cannot deliver real setup codes.

Vercel runtime variables for SES setup email delivery:

- `ASKSAFE_SETUP_EMAIL_PROVIDER=ses`
- `ASKSAFE_SETUP_EMAIL_FROM=<verified SES sender email>`
- `AWS_REGION=ap-southeast-2`
- `ASKSAFE_OTP_SECRET=<strong secret>`
- `ASKSAFE_SESSION_SECRET=<strong secret>`

Local development may use `ASKSAFE_SETUP_EMAIL_MODE=console` for smoke checks
only. Console mode is not a production delivery path.

## Terraform GitHub Actions Workflow

After the CloudFormation bootstrap stack is deployed and the
`AWS_GITHUB_ACTIONS_ROLE_ARN` secret is set, use the `Terraform` GitHub Actions
workflow to run app infrastructure changes.

The workflow is manual only and supports:

- `plan`
- `apply`
- `destroy`

All jobs run through the protected GitHub environment `aws-infra` and assume the
AWS role through OIDC. Do not add long-lived AWS access keys to GitHub.

Expected repository variables:

- `AWS_REGION=ap-southeast-2`
- `TF_STATE_BUCKET=asksafe-home-tfstate-893794041695`
- `TF_STATE_KEY=asksafe-home/prod/terraform.tfstate`
- `TF_LOCK_TABLE=asksafe-home-tflock`
- `TF_PROJECT_NAME=asksafe-home`
- `TF_ENVIRONMENT=prod`
- `TF_BEDROCK_MODEL_ARNS=[]` until Bedrock is intentionally enabled
- `TF_ENABLE_SETUP_EMAIL_SES=false` until SES delivery is intentionally enabled
- `TF_SETUP_EMAIL_FROM_ADDRESS=` until a sender address is selected

When Bedrock explanation assist is enabled for production smoke testing, set
`TF_BEDROCK_MODEL_ARNS` to a JSON list of allowed model ARNs. For the current
Claude Haiku 4.5 candidate in `ap-southeast-2`, use:

```json
["arn:aws:bedrock:ap-southeast-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"]
```

This updates only the runtime IAM policy allowlist. Vercel still needs its
separate runtime environment variables before the app attempts Bedrock.

When SES setup email delivery is enabled, set `TF_ENABLE_SETUP_EMAIL_SES=true`
and `TF_SETUP_EMAIL_FROM_ADDRESS` to the intended sender email address before
running `apply`. First update the CloudFormation bootstrap stack with the same
sender email in `SetupEmailFromAddress` so the GitHub Actions Terraform role can
manage only that SES sender identity.

Expected repository secret:

- `AWS_GITHUB_ACTIONS_ROLE_ARN=<CloudFormation GitHubActionsRoleArn output>`

Destroy requires selecting `destroy` and typing `destroy` into the
`confirm_destroy` input. GitHub environment protection should also require a
reviewer before allowing destructive runs.
