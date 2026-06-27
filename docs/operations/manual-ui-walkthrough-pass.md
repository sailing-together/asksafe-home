# Manual UI Walkthrough Pass

Date: 2026-06-26
Production URL: https://asksafe-home.vercel.app
Related checklist: docs/operations/product-walkthrough-readiness-checklist.md

## Purpose

This document records the manual UI checks to complete before recording the
AskSafe Home product walkthrough video.

The API-level scenario evidence proves the production analysis path works. This
manual pass focuses on the user-facing product walkthrough experience: navigation, input,
result readability, trusted support, official help, and recording fallbacks.

## Scope

This is a browser-level product readiness check, not a code test suite.

Use synthetic examples only. Do not enter real passwords, one-time codes, card
numbers, phone numbers, identity details, or private family details.

## Desktop Pass

Check these items on the production site:

| Area | Expected result | Status |
| --- | --- | --- |
| Home screen | Loads clearly with the AskSafe Home identity and primary "I feel unsure" action | To check |
| Header navigation | Clicking the AskSafe Home logo or title returns to the home screen | To check |
| Setup | "My setup" opens and closes without blocking the safety check flow | To check |
| Start flow | "I feel unsure" starts the guided safety check | To check |
| Situation choice | "Video call or online chat" is visible and selectable | To check |
| Guided input | Text entry works for the daughter video call money request scenario | To check |
| Request chips | "Pay money" can be selected | To check |
| Voice input | Voice input is optional and does not block typed input | To check |
| Submit | The user can submit the check and reach the result page | To check |
| Result page | Safer next step appears before deeper explanation | To check |
| Risk signals | Risk signals are visible and understandable | To check |
| Not-yet actions | The result clearly says what not to do yet | To check |
| Verification steps | The result explains how to verify through a trusted channel | To check |
| Read aloud | Works in the target browser, or can be skipped without disrupting the product walkthrough | To check |
| Trusted support | Trusted support action opens from the result page | To check |
| Official help | Official help links are visible and clickable | To check |
| Feedback | Feedback controls do not distract from the main result story | To check |
| Start another check | "Check something else" starts a new safety check | To check |

## Mobile Pass

Check these items on a phone-sized viewport or real mobile device:

| Area | Expected result | Status |
| --- | --- | --- |
| Home screen | Primary action is visible without confusing extra choices | To check |
| Text size | Main headings, cards, buttons, and result text are readable | To check |
| Spacing | Buttons and chips have enough spacing for touch input | To check |
| Guided input | Text area and request chips fit without overlapping | To check |
| Result page | The high-risk result can be read by scrolling naturally | To check |
| Official help | Emergency and Scamwatch actions remain easy to find | To check |
| Footer | Disclaimer and official help references remain readable | To check |

## Main Product Walkthrough Scenario

Use this synthetic scenario for the primary recording:

```text
My daughter asked me on a video call to send 2000 AUD today.
```

Category:

- Video call or online chat

Request chips:

- Pay money

Expected story:

- AskSafe does not claim to prove whether the video is real or fake.
- AskSafe highlights risk signals.
- AskSafe asks the user to pause before sending money.
- AskSafe recommends contacting the daughter through a saved trusted channel.
- AskSafe makes trusted support available without forcing the user to share.

## Recording Fallbacks

Use these fallbacks if browser features behave differently during recording:

- If voice input is slow or unreliable, type the scenario instead.
- If read-aloud does not respond, skip it and continue walking through the
  result page.
- If the UI appears slow after submit, wait before clicking again.
- If Bedrock is unavailable, continue with deterministic fallback and explain
  that the safety baseline still works.
- If production is unavailable, use the rollback runbook before recording.

## Pass Criteria

The product walkthrough is ready to record when:

- The main daughter video call money request flow reaches a clear high-risk
  result.
- The result gives a practical safer next step without shaming or frightening
  the user.
- Navigation back to home works.
- The team can explain Bedrock as wording assistance bounded by deterministic
  safety rules.
- The team has a fallback plan for voice, read-aloud, or production issues.

## Notes For Product Walkthrough Narration

Recommended phrasing:

```text
AskSafe Home is not trying to prove whether a message, voice, or video is real.
It helps someone pause, notice risk signals, and choose a safer next step before
they act.
```

Keep the product walkthrough focused on reducing uncertainty, fear, and decision pressure for
seniors.
