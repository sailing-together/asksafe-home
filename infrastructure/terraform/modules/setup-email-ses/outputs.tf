output "enabled" {
  description = "Whether the SES setup email identity is enabled."
  value       = var.enabled
}

output "from_address" {
  description = "Verified sender email address used for AskSafe setup emails."
  value       = var.enabled ? var.from_address : null
}

output "identity_arn" {
  description = "SES sender identity ARN for runtime IAM permissions."
  value       = var.enabled ? aws_sesv2_email_identity.setup_sender[0].arn : null
}
