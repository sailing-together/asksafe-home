locals {
  name_prefix = "${var.project_name}-${var.environment}"

  tags = {
    Project     = "AskSafeHome"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

output "name_prefix" {
  description = "Prefix used by future AskSafe Home app resources."
  value       = local.name_prefix
}
