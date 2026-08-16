resource "aws_sesv2_email_identity" "setup_sender" {
  count = var.enabled ? 1 : 0

  email_identity = var.from_address

  tags = var.tags
}
