import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const terraformVariables = readFileSync("infrastructure/terraform/variables.tf", "utf8")
const terraformMain = readFileSync("infrastructure/terraform/main.tf", "utf8")
const terraformOutputs = readFileSync("infrastructure/terraform/outputs.tf", "utf8")
const workflow = readFileSync(".github/workflows/terraform.yml", "utf8")
const bootstrap = readFileSync("infrastructure/cloudformation/terraform-bootstrap.yml", "utf8")

test("Terraform separates SES domain identity from setup email sender address", () => {
  assert.match(terraformVariables, /variable "setup_email_identity"/)
  assert.match(terraformMain, /identity\s+=\s+var\.setup_email_identity/)
  assert.match(terraformMain, /setup_email_ses_identity_enabled\s+=\s+var\.enable_setup_email_ses && var\.setup_email_identity != ""/)
  assert.match(terraformMain, /setup_email_ses_runtime_configured\s+=\s+local\.setup_email_ses_identity_enabled && var\.setup_email_from_address != ""/)
  assert.match(terraformOutputs, /ASKSAFE_SETUP_EMAIL_FROM\s+=\s+local\.setup_email_ses_runtime_configured\s+\?\s+var\.setup_email_from_address/)
  assert.match(terraformOutputs, /ASKSAFE_SETUP_EMAIL_PROVIDER\s+=\s+local\.setup_email_ses_runtime_configured/)
  assert.match(terraformOutputs, /ASKSAFE_SETUP_EMAIL_SES_IDENTITY\s+=\s+local\.setup_email_ses_identity_enabled/)
})

test("GitHub Actions and bootstrap use the SES identity value for scoped Terraform permissions", () => {
  assert.match(workflow, /TF_VAR_setup_email_identity:\s+\$\{\{\s*vars\.TF_SETUP_EMAIL_IDENTITY\s*\}\}/)
  assert.match(bootstrap, /SetupEmailIdentity:/)
  assert.match(bootstrap, /HasSetupEmailIdentity:/)
  assert.match(bootstrap, /identity\/\$\{SetupEmailIdentity\}/)
  assert.doesNotMatch(bootstrap, /SetupEmailFromAddress/)
})
