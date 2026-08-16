variable "enabled" {
  type        = bool
  description = "Whether to create an Amazon SES identity for AskSafe setup emails."
}

variable "identity" {
  type        = string
  description = "Amazon SES identity to verify for AskSafe setup emails. Use a domain such as asksafe.ai for production."
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to SES resources."
  default     = {}
}
