# Optional Setup Persistence Design

## Status

Post-H0 production hardening design and implementation note. P8.5 turns the
optional `My setup` flow from a browser-only/mock sign-in experience into a
server-backed setup foundation with DynamoDB OTP challenges, HTTP-only session
cookies, and DynamoDB user/household setup persistence.

P8.6 adds the production email delivery path for setup codes through Amazon SES.
The core safety check still does not require sign-in. Email delivery is explicit:
the server no longer pretends to send a code. Production email sending requires a
configured and verified SES sender; otherwise the API returns a clear
`email-not-configured` response and the user can continue using AskSafe without
setup.

## Product Boundary

AskSafe Home's core safety check must remain usable without an account.

Optional setup exists for continuity and trusted support, not as a gate in front
of urgent safety guidance. A user should be able to open AskSafe, describe a
situation, and receive a safer next step without signing in.

Trusted support must remain user-controlled:

- no automatic family monitoring
- no automatic sharing with a trusted person
- no hidden dashboard for relatives
- no requirement to add a trusted person before using AskSafe
- no storage of passwords, one-time codes, full card numbers, or sensitive
  identity details

## Current State

The current UI includes:

- `components/trusted-support-dialog.tsx`
- `app/page.tsx`
- `SupportSetup` state hydrated from the setup API when a valid session exists
- optional trusted person setup fields
- support event recording for actions such as `setup-opened` and `code-created`

The current backend includes:

- `POST /api/setup/request-code` for server-generated email OTP challenges
- `POST /api/setup/verify-code` for OTP verification and HTTP-only session issue
- `GET /api/setup/me` for loading saved optional setup
- `PUT /api/setup/me` for saving optional setup
- `POST /api/setup/sign-out` for clearing the setup session cookie

The current backend uses DynamoDB tables for:

- `asksafe-home-prod-users`
- `asksafe-home-prod-households`
- `asksafe-home-prod-support-events`
- `asksafe-home-prod-events`
- `asksafe-home-prod-feedback`

The current persistence layer writes privacy-safe safety, feedback, support, user setup, and household setup records. Contact fields are hashed before persistence; raw email is used only transiently for OTP delivery.

## Desired User Experience

### No-Login Path

1. User opens AskSafe Home.
2. User starts a safety check without signing in.
3. User receives the safety result.
4. User may optionally choose `My setup` or trusted support later.

### Optional Setup Path

1. User opens `My setup`.
2. AskSafe explains that setup is optional and helps remember preferences.
3. User enters an email address.
4. AskSafe sends a real one-time code or magic link when email delivery is configured.
5. User verifies the code or opens the magic link.
6. AskSafe creates or loads a lightweight user profile.
7. User can save personal setup and optional trusted person details.
8. User can edit or delete setup later.

### Trusted Support Path

1. User adds a trusted person only if they choose to.
2. AskSafe explains that adding a trusted person does not share anything by
   itself.
3. User can choose to share a safety summary after a result.
4. AskSafe records the support action as an event.
5. Trusted support data is used for continuity and user-controlled sharing, not
   monitoring.

## Authentication Options

### Preferred First Implementation: Email OTP Or Magic Link

Use email as the first production path because it is easier to audit and less
expensive than SMS.

Required behavior:

- code or link expires quickly
- repeated requests are rate-limited
- failed attempts are limited
- sign-in does not block the core safety check
- no raw OTP is stored in DynamoDB
- any OTP hash or verification token has a short TTL

### Later Option: Phone OTP

Phone OTP can be added later for users who do not use email comfortably, but it
has extra cost, abuse, deliverability, and privacy considerations.

### Runtime Configuration

The implemented setup routes require these server-side environment variables:

- `ASKSAFE_OTP_SECRET` for hashing short-lived one-time codes
- `ASKSAFE_SESSION_SECRET` for signing HTTP-only setup session cookies

Email delivery is intentionally explicit. For production setup emails through
Amazon SES, configure:

- `ASKSAFE_SETUP_EMAIL_PROVIDER=ses`
- `ASKSAFE_SETUP_EMAIL_FROM=<verified SES sender email>`
- `AWS_REGION=ap-southeast-2`

Terraform can create the SES sender identity, but the sender still must be
verified through AWS SES before messages can be delivered. If SES is not
configured or the sender is not usable, `POST /api/setup/request-code` returns
`email-not-configured` or `email-send-failed` and the UI tells the user they can
still use AskSafe without setup.

Local operators can use `ASKSAFE_SETUP_EMAIL_MODE=console` only for development
smoke checks. Console mode must not be presented as a real delivery path.

## DynamoDB Data Model

The existing Terraform tables are a good starting point. The implementation
should use the current tables before adding new tables.

### Users Table

Table: `asksafe-home-prod-users`

Primary key:

- `userId` string

Existing index:

- `emailHash-index`

Recommended item shape:

```json
{
  "userId": "usr_...",
  "emailHash": "sha256-normalized-email",
  "phoneHash": "sha256-normalized-phone-if-present",
  "displayName": "Margaret",
  "usingFor": "self",
  "createdAt": "2026-06-29T00:00:00.000Z",
  "updatedAt": "2026-06-29T00:00:00.000Z",
  "schemaVersion": 1
}
```

Do not store raw email or phone unless a production privacy decision explicitly
requires it. If raw contact details are needed for email delivery, prefer the
identity provider or email service as the contact source instead of duplicating
PII in DynamoDB.

### Households Table

Table: `asksafe-home-prod-households`

Primary key:

- `householdId` string

Existing index:

- `supportCode-index`

Recommended item shape:

```json
{
  "householdId": "hh_...",
  "ownerUserId": "usr_...",
  "trustedPerson": {
    "name": "Sarah",
    "relationship": "Daughter",
    "emailHash": "sha256-normalized-email-if-present",
    "phoneHash": "sha256-normalized-phone-if-present"
  },
  "supportCode": "SAFE-1234",
  "consentStatus": "owner_configured",
  "createdAt": "2026-06-29T00:00:00.000Z",
  "updatedAt": "2026-06-29T00:00:00.000Z",
  "schemaVersion": 1
}
```

The support code must not grant broad access by itself. It should be treated as
a low-risk pairing or continuity cue, not an authentication secret for sensitive
records.

### Support Events Table

Table: `asksafe-home-prod-support-events`

Keep event records separate from setup records. Support events should record
user-controlled actions such as:

- `setup-opened`
- `setup-saved`
- `setup-deleted`
- `trusted-person-added`
- `summary-shared`

## API Surface

Proposed routes:

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
- `POST /api/setup`
- `GET /api/setup`
- `DELETE /api/setup`

All setup routes require a verified session. The safety-check routes should not
require a session.

### `POST /api/auth/request-code`

Input:

```json
{
  "channel": "email",
  "contact": "user@example.com"
}
```

Behavior:

- normalize contact
- rate-limit by contact hash and IP-derived anonymous subject
- create short-lived verification token
- send email OTP or magic link
- return generic success to avoid account enumeration

### `POST /api/auth/verify-code`

Input:

```json
{
  "channel": "email",
  "contact": "user@example.com",
  "code": "123456"
}
```

Behavior:

- verify code using constant-time comparison against a stored hash
- create or load user by contact hash
- issue session cookie
- never return whether an email is already registered before verification

### `POST /api/setup`

Input:

```json
{
  "displayName": "Margaret",
  "usingFor": "self",
  "trustedPerson": {
    "name": "Sarah",
    "relationship": "Daughter",
    "email": "sarah@example.com",
    "phone": ""
  }
}
```

Behavior:

- validate length and allowed values
- hash contact fields before persistence
- update users table
- update households table if trusted person is present
- write a support event

### `GET /api/setup`

Behavior:

- return the saved setup for the signed-in user
- avoid returning raw trusted contact details unless raw storage has been
  explicitly approved
- include enough display data for the setup summary UI

### `DELETE /api/setup`

Behavior:

- delete or tombstone user setup and household setup
- write a support event
- clear session if requested by the UI

## Privacy And Security Rules

- Do not store raw safety-check text by default.
- Do not store passwords, one-time codes, full card numbers, bank details, or
  sensitive identity details.
- Do not store raw OTP values.
- Do not use trusted contact setup for automatic alerts.
- Do not expose support code lookup as a broad record access mechanism.
- Use rate limits for OTP requests and verification attempts.
- Keep the core safety check available when auth fails.
- Use clear copy explaining that nothing is shared unless the user chooses to
  share it.

## Implementation Sequence

Recommended PR sequence:

1. Replace misleading mock setup copy or hide mock code in production.
2. Add auth design constants, session interface, and route tests.
3. Implement email OTP or magic-link request and verification routes.
4. Add setup persistence helpers for users and households.
5. Connect `TrustedSupportDialog` to setup APIs.
6. Add load, edit, delete, sign-out, and failure states.
7. Add smoke tests for setup persistence.
8. Update production readiness and privacy documentation.

## Acceptance Criteria

A production-ready version should satisfy:

- anonymous users can complete a safety check
- signed-in users can save setup
- signed-in users can reload setup in a new browser session
- users can delete setup
- trusted support remains optional
- no raw OTP is stored
- no automatic sharing occurs
- DynamoDB stores user setup and household setup with minimal fields
- setup API tests and smoke tests pass
- README and architecture docs describe the behavior truthfully
