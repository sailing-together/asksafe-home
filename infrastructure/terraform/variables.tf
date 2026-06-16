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
