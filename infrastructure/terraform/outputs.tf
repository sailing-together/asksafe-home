output "name_prefix" {
  description = "Prefix used by AskSafe Home app resources."
  value       = local.name_prefix
}

output "dynamodb_table_names" {
  description = "DynamoDB table names for AskSafe Home runtime configuration."
  value = {
    users          = aws_dynamodb_table.users.name
    households     = aws_dynamodb_table.households.name
    events         = aws_dynamodb_table.events.name
    feedback       = aws_dynamodb_table.feedback.name
    support_events = aws_dynamodb_table.support_events.name
  }
}

output "vercel_environment_variables" {
  description = "Suggested Vercel environment variables for server-side runtime configuration."
  value = {
    AWS_REGION                         = var.aws_region
    ASKSAFE_USERS_TABLE                = aws_dynamodb_table.users.name
    ASKSAFE_HOUSEHOLDS_TABLE           = aws_dynamodb_table.households.name
    ASKSAFE_EVENTS_TABLE               = aws_dynamodb_table.events.name
    ASKSAFE_FEEDBACK_TABLE             = aws_dynamodb_table.feedback.name
    ASKSAFE_SUPPORT_EVENTS_TABLE       = aws_dynamodb_table.support_events.name
    ASKSAFE_RUNTIME_IAM_POLICY_ARN     = aws_iam_policy.runtime.arn
    ASKSAFE_BEDROCK_MODEL_ARNS_ENABLED = tostring(length(var.bedrock_model_arns) > 0)
    ASKSAFE_SETUP_EMAIL_PROVIDER       = var.enable_setup_email_ses ? "ses" : ""
    ASKSAFE_SETUP_EMAIL_FROM           = var.enable_setup_email_ses ? module.setup_email_ses.from_address : ""
    ASKSAFE_SETUP_EMAIL_SES_IDENTITY   = var.enable_setup_email_ses ? module.setup_email_ses.identity_arn : ""
  }
}

output "runtime_policy_arn" {
  description = "IAM policy ARN for server-side AskSafe Home runtime access."
  value       = aws_iam_policy.runtime.arn
}

output "setup_email_ses_identity" {
  description = "SES sender identity created for AskSafe setup email delivery, when enabled."
  value = {
    enabled      = module.setup_email_ses.enabled
    from_address = module.setup_email_ses.from_address
    identity_arn = module.setup_email_ses.identity_arn
  }
}
