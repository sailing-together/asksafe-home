output "enabled" {
  description = "Whether the SES setup identity is enabled."
  value       = var.enabled
}

output "identity" {
  description = "SES identity created for AskSafe setup emails."
  value       = var.enabled ? var.identity : null
}

output "identity_arn" {
  description = "SES identity ARN for runtime IAM permissions."
  value       = var.enabled ? aws_sesv2_email_identity.setup_sender[0].arn : null
}
