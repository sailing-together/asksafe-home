variable "enabled" {
  type        = bool
  description = "Whether to create an Amazon SES sender identity for AskSafe setup emails."
}

variable "from_address" {
  type        = string
  description = "Sender email address for AskSafe setup emails."
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to SES resources."
  default     = {}
}
