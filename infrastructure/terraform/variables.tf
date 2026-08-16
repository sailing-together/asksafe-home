variable "aws_region" {
  type        = string
  description = "AWS region for AskSafe Home application infrastructure."
  default     = "ap-southeast-2"
}

variable "project_name" {
  type        = string
  description = "Project name prefix for AWS resources."
  default     = "asksafe-home"
}

variable "environment" {
  type        = string
  description = "Environment name for AWS resources."
  default     = "prod"
}

variable "bedrock_model_arns" {
  type        = list(string)
  description = "Optional Bedrock model ARNs the server runtime may invoke. Leave empty until Bedrock access is approved."
  default     = []
}

variable "enable_setup_email_ses" {
  type        = bool
  description = "Whether Terraform should create an Amazon SES sender identity for setup OTP emails."
  default     = false
}

variable "setup_email_from_address" {
  type        = string
  description = "Sender email address for AskSafe setup OTP emails. Required when enable_setup_email_ses is true."
  default     = ""

  validation {
    condition     = var.setup_email_from_address == "" || can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.setup_email_from_address))
    error_message = "setup_email_from_address must be empty or a valid email address."
  }
}
