# Architecture Icon Sources

This folder keeps the icon assets used by `asksafe-home-architecture.svg`.

## Official AWS icons

The files under `icons/aws/` were extracted from the official AWS Architecture Icons package downloaded from AWS Architecture Center:

- `amazon-bedrock.svg`
- `amazon-dynamodb.svg`
- `aws-budgets.svg`
- `aws-cloudformation.svg`
- `aws-iam.svg`

Source package used during preparation:

```text
https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/architecture/approved/architecture-icons/Icon-package_04302026.4705b90f5aa45b019271a2699e9ce9b97b941ee1.zip
```

The original downloaded zip is intentionally not committed so the repository only stores the small selected SVG assets needed for the architecture diagram.

## Non-AWS platform icons

The diagram also includes sourced SVG brand icons for non-AWS tools that appear in the architecture:

- `icons/brand/vercel.svg` - Vercel icon from Simple Icons (`vercel`)
- `icons/brand/nextjs.svg` - Next.js icon from Simple Icons (`nextdotjs`)
- `icons/brand/github-actions.svg` - GitHub Actions icon from Simple Icons (`githubactions`)
- `icons/brand/github.svg` - GitHub icon from Simple Icons (`github`), kept for future diagram variants
- `icons/brand/terraform.svg` - Terraform icon from Simple Icons (`terraform`)
- `icons/brand/v0.svg` - v0 icon from Simple Icons (`v0`)

Simple Icons assets are used as sourced brand SVGs for diagram readability. They are not AWS Architecture Icons. Follow each brand's trademark guidelines for external publication.

## Custom diagram marks

FinOps is shown as a custom cost guardrail cue because there is no single official FinOps architecture service icon for this product context.
