locals {
  name_prefix                        = "${var.project_name}-${var.environment}"
  setup_email_ses_identity_enabled   = var.enable_setup_email_ses && var.setup_email_identity != ""
  setup_email_ses_runtime_configured = local.setup_email_ses_identity_enabled && var.setup_email_from_address != ""

  tags = {
    Project     = "AskSafeHome"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  runtime_table_arns = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.households.arn,
    aws_dynamodb_table.events.arn,
    aws_dynamodb_table.feedback.arn,
    aws_dynamodb_table.support_events.arn,
  ]

  runtime_table_index_arns = [
    "${aws_dynamodb_table.users.arn}/index/*",
    "${aws_dynamodb_table.households.arn}/index/*",
    "${aws_dynamodb_table.events.arn}/index/*",
    "${aws_dynamodb_table.feedback.arn}/index/*",
    "${aws_dynamodb_table.support_events.arn}/index/*",
  ]
}

module "setup_email_ses" {
  source = "./modules/setup-email-ses"

  enabled  = local.setup_email_ses_identity_enabled
  identity = var.setup_email_identity
  tags = merge(local.tags, {
    LogicalName = "AskSafeSetupEmail"
  })
}

resource "aws_dynamodb_table" "users" {
  name                        = "${local.name_prefix}-users"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true
  hash_key                    = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "emailHash"
    type = "S"
  }

  global_secondary_index {
    name            = "emailHash-index"
    hash_key        = "emailHash"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.tags, {
    LogicalName = "AskSafeUsers"
  })
}

resource "aws_dynamodb_table" "households" {
  name                        = "${local.name_prefix}-households"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true
  hash_key                    = "householdId"

  attribute {
    name = "householdId"
    type = "S"
  }

  attribute {
    name = "supportCode"
    type = "S"
  }

  global_secondary_index {
    name            = "supportCode-index"
    hash_key        = "supportCode"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.tags, {
    LogicalName = "AskSafeHouseholds"
  })
}

resource "aws_dynamodb_table" "events" {
  name                        = "${local.name_prefix}-events"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true
  hash_key                    = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "householdId"
    type = "S"
  }

  attribute {
    name = "createdByUserId"
    type = "S"
  }

  attribute {
    name = "riskLevel"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "householdId-createdAt-index"
    hash_key        = "householdId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "createdByUserId-createdAt-index"
    hash_key        = "createdByUserId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "riskLevel-createdAt-index"
    hash_key        = "riskLevel"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.tags, {
    LogicalName = "AskSafeEvents"
  })
}

resource "aws_dynamodb_table" "feedback" {
  name                        = "${local.name_prefix}-feedback"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true
  hash_key                    = "feedbackId"

  attribute {
    name = "feedbackId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "eventId-createdAt-index"
    hash_key        = "eventId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.tags, {
    LogicalName = "AskSafeFeedback"
  })
}

resource "aws_dynamodb_table" "support_events" {
  name                        = "${local.name_prefix}-support-events"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true
  hash_key                    = "supportEventId"

  attribute {
    name = "supportEventId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "householdId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "eventId-createdAt-index"
    hash_key        = "eventId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "householdId-createdAt-index"
    hash_key        = "householdId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.tags, {
    LogicalName = "AskSafeSupportEvents"
  })
}

data "aws_iam_policy_document" "runtime" {
  statement {
    sid    = "AskSafeHomeDynamoRuntimeAccess"
    effect = "Allow"

    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:TransactWriteItems",
      "dynamodb:UpdateItem",
    ]

    resources = concat(local.runtime_table_arns, local.runtime_table_index_arns)
  }

  dynamic "statement" {
    for_each = length(var.bedrock_model_arns) > 0 ? [1] : []

    content {
      sid    = "AskSafeHomeBedrockRuntimeAccess"
      effect = "Allow"

      actions = [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
      ]

      resources = var.bedrock_model_arns
    }
  }

  dynamic "statement" {
    for_each = local.setup_email_ses_identity_enabled ? [1] : []

    content {
      sid    = "AskSafeHomeSetupEmailSesAccess"
      effect = "Allow"

      actions = [
        "ses:SendEmail",
      ]

      resources = [module.setup_email_ses.identity_arn]
    }
  }
}

resource "aws_iam_policy" "runtime" {
  name        = "${local.name_prefix}-runtime-policy"
  description = "Least-privilege runtime access for AskSafe Home server-side API routes."
  policy      = data.aws_iam_policy_document.runtime.json

  tags = merge(local.tags, {
    Purpose = "Server runtime access"
  })
}
