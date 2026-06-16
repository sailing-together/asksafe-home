# AskSafe Home Infrastructure

This folder contains the AWS bootstrap and Terraform app infrastructure entry
point for AskSafe Home.

## Scope

This phase adds only the AWS bootstrap foundation:

- S3 bucket for Terraform remote state
- DynamoDB table for Terraform state locking
- GitHub Actions OIDC provider
- Limited GitHub Actions role for Terraform
- Terraform backend example wiring for future app resources

This phase does not create:

- application DynamoDB tables
- Bedrock runtime integration
- Next.js API routes
- Vercel runtime credentials

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
