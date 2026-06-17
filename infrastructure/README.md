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
- runtime IAM policy for server-side app access
- Terraform outputs for Vercel runtime configuration

This folder does not create:

- Next.js API routes
- Vercel secrets
- direct browser access to AWS
- Bedrock runtime code

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

The S3 bucket and DynamoDB lock table are retained on stack deletion. Delete
them manually only after every Terraform state file has been backed up or is no
longer needed.

If this bootstrap template changes, update the CloudFormation stack before
rerunning Terraform in GitHub Actions. Terraform's S3 backend lists state
workspace prefixes during `terraform init`.

The GitHub Actions Terraform role also needs read-after-create permissions used
by AWS providers, such as DynamoDB continuous backup status checks during apply.

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

Expected repository secret:

- `AWS_GITHUB_ACTIONS_ROLE_ARN=<CloudFormation GitHubActionsRoleArn output>`

Destroy requires selecting `destroy` and typing `destroy` into the
`confirm_destroy` input. GitHub environment protection should also require a
reviewer before allowing destructive runs.
