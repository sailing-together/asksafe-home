# v0.app Iteration Log

This document records the prompt-driven path used to build the AskSafe Home UI
and early interactive preview in v0.app.

It complements `journey-log.md`:

- `journey-log.md` explains the product and engineering journey.
- this file records the v0.app prompts, scope guards, screenshot feedback, and
  transition into GitHub/Vercel.

Some prompts below are exact text preserved from the working chat. Later entries
are recorded as close operational summaries when the exact submitted prompt is
not fully available in the repository.

## Prompt 1: UI Preview Only

Purpose:

Build only the first working AskSafe Home preview UI. Keep the scope small and
avoid backend, AWS, Bedrock, auth, and GitHub import.

Result:

v0 created the first senior-friendly AskSafe Home web app preview with a home
screen, guided check flow, message input concept, result card, trusted support
action, and official Australian help section.

Prompt:

```text
Do not connect Amazon DynamoDB yet.
Do not set up backend integration yet.
Do not import GitHub yet.

First build only the AskSafe Home working preview UI.

AskSafe Home is an AI decision companion that helps seniors make safer decisions when they feel unsure.

Design it as a responsive web app for desktop and mobile browsers.

Use:
- Next.js App Router
- TypeScript
- React
- Tailwind
- shadcn/ui

Create:
- Home screen
- A guided "I feel unsure" check flow
- A message/situation input area
- A result card with risk level, safer next step, what not to do yet, why, verification steps
- Trusted Support action
- Official help in Australia section

Design:
- senior-friendly but modern
- warm off-white background
- deep green trust color
- orange shield accent
- large readable text
- one task at a time
- not a generic chatbot
- no "coming soon", "prototype", or "demo only" text

Only make the preview work first.
```

Notes:

- This prompt set the most important scope boundary: preview first, backend
  later.
- The UI direction established the AskSafe Home visual language.

## Prompt 2: Interactive Local Safety Flow

Purpose:

Make the safety check flow interactive while keeping all analysis deterministic
and local.

Result:

v0 added situation selection, input screen, action chips, analyze button,
thinking state, and deterministic local mock result generation.

Prompt:

```text
Good direction. Keep this visual style.

Now make the safety check flow interactive without adding AWS yet.

When the user chooses a situation type, show a simple input screen where they can type what happened or paste a message.

Add:
- text input area
- optional quick choices for what the other person wants them to do: pay money, click a link, share a code, give personal details, call back, not sure
- Analyze button
- loading/thinking state
- result screen generated from the input using local deterministic mock logic

Keep the current result card style.
Do not add DynamoDB yet.
Do not add Bedrock yet.
Do not add authentication yet.
Do not add "coming soon" or "prototype" text.
```

Notes:

- The action chips became central to the product because AskSafe needs to know
  what the other person is asking the user to do.
- The "local deterministic mock logic" boundary kept the product shippable
  without pretending the backend already existed.

## Prompt 3: UI Polish, Official Help, Video Chat, Mobile

Purpose:

Refine visual hierarchy and mobile layout after reviewing desktop and mobile
screenshots. Add video call or online chat as a first-class situation type.

Result:

v0 improved the home page, step 1, step 2, and result views. It added video call
or online chat, mobile spacing improvements, extra action chips such as install
an app and share my screen, and stronger official help guidance.

Operational prompt summary:

```text
Keep the current AskSafe Home visual direction, but polish the flow for mobile and desktop.

Add "Video call or online chat" as a situation type.

For video call or online chat, ask what happened, who they claimed to be, and what they asked the user to do.

Add quick choices for:
- Pay money
- Click a link
- Share a code
- Give personal details
- Call back
- Install an app
- Share my screen
- Not sure

Improve mobile spacing so the hero, input screen, chips, and result sections feel calm and readable without excessive vertical gaps.

Keep it senior-friendly, one task at a time, and do not add AWS, Bedrock, or real authentication yet.
```

Screenshot feedback that shaped the prompt:

- video chat did not fit existing categories well
- mobile screens needed tighter spacing
- result pages needed to remain readable without hiding key next steps

## Prompt 4: Trusted Support, Footer, Practice Examples

Purpose:

Make trusted support more concrete, add a footer that feels trustworthy, and add
lightweight practice examples without turning the home page into an education
site.

Result:

v0 added trusted support setup concepts, support code UI, compact official help
and footer content, and practice examples for common scam situations.

Operational prompt summary:

```text
Add a trusted support flow.

When the user chooses "Talk to someone I trust", let them optionally add someone they trust such as a family member, close friend, neighbour, carer, or community support worker.

Create a support code that can be shared later.

Make the copy clear:
- The user can use AskSafe without setting this up.
- Nothing is shared unless the user chooses to share it.
- The support code does not share anything by itself.

Add a simple trustworthy footer with:
- AskSafe Home description
- safety disclaimer
- official help references
- Privacy, Disclaimer, Accessibility, GitHub
- copyright line

Add a compact practice section with examples:
- Bank message with a link
- Urgent money request
- Tech support call

Keep the page calm and avoid adding backend integration yet.
```

Screenshot feedback that shaped the prompt:

- trusted support needed a real interaction instead of a dead button
- official help should be easy for older adults to find
- the practice section was useful but could take too much space
- footer should feel like a credible product footer, not a prototype note

## Prompt 5: Voice Input And Read Aloud

Purpose:

Add accessibility-oriented voice input and result read-aloud while keeping the
screen text short.

Result:

v0 added a voice input button on the situation input screen and a read-aloud
button near the result. Later feedback showed the first voice version stopped
too early and read-aloud reliability needed improvement.

Operational prompt summary:

```text
Add voice input to the situation input screen and read-aloud support to the result screen.

Keep the UI simple:
- a clear "Use voice" button near the text input
- a clear "Read this aloud" button on the result page

Do not add long explanatory copy.
Do not use "preview", "demo", or "coming soon" language.

Keep all behavior local for now and do not add AWS, Bedrock, or real authentication.
```

Follow-up feedback:

- remove wording such as "Voice stays on this device for this preview"
- avoid extra text such as "Voice is optional"
- improve the weak voice flow using the earlier AskSafe conversational pattern
- read-aloud must actually respond when tapped

## Prompt 6: My AskSafe Setup And Mock Sign-In

Purpose:

Make setup feel shippable without real authentication. Let AskSafe remember a
person through a mock one-time-code style flow while preserving privacy and user
control.

Result:

v0 added a setup modal, email-based mock sign-in, optional phone number, user
name, using AskSafe for myself or someone I care about, trusted person details,
support code, "My setup" summary, and sign out.

Operational prompt summary:

```text
Add a simple AskSafe setup flow.

The user should be able to continue with AskSafe using an email address or phone number and a one-time code style flow.

This is still a local/mock flow for now.

Setup should collect:
- user's name or nickname
- email address
- optional phone number
- whether they are using AskSafe for themselves or someone they care about
- optional trusted person name
- relationship
- optional trusted person's email
- optional trusted person's phone

After setup, show "My setup" in the header and a summary modal.

Include sign out.

Make the privacy copy clear:
- user can use AskSafe without full setup
- nothing is shared unless the user chooses to share it
- support code does not share content by itself

Do not add real OAuth, DynamoDB, Bedrock, or backend persistence yet.
```

Screenshot feedback that shaped the prompt:

- there was setup but no login/logout at first
- the UI needed to show who was signed in
- email should be required, phone optional
- Gmail or other email should be allowed conceptually
- OAuth should not be forced at this stage

## Prompt 7: GitHub And Vercel Transition

Purpose:

Move from v0-only development into a GitHub/Vercel workflow.

Result:

The v0 project was connected to GitHub under `sailing-together/asksafe-home`,
and Vercel production deployment was set up for the product repo.

Operational notes:

- v0 created or connected the GitHub repository
- the project name was aligned around `asksafe-home`
- the Vercel domain was changed to `asksafe-home.vercel.app`
- README preserved the v0 link as project provenance
- v0-generated README content was intentionally retained as evidence of project
  origin and continuing v0 workflow

Important repo decision:

The repo should be treated as the formal product repo, not only a competition
repo. Public names should avoid over-indexing on H0.

## Prompt 8: Chat-Style Step 2 Follow-Up

Purpose:

Explore whether the form-like Step 2 could feel more like guided help.

Result:

The input flow was changed toward assistant bubbles, user-side message bubbles,
selected action summaries, and one follow-up when the user gave too little
detail.

Operational prompt summary:

```text
Change Step 2 from a form-style input screen into a guided chat-style interaction.

Add AskSafe assistant message bubbles to guide the user.
Show submitted details as user-side message bubbles.
Show selected action chips as a user-side summary.
Ask one follow-up if the user gives too little detail or does not clarify what they are being asked to do.

Keep the existing result card, analyzer, page flow, and onSubmit(message, requests) contract.

Do not add a generic chatbot, backend persistence, DynamoDB, Bedrock, or auth changes.
```

Follow-up feedback:

- the repeated chat response felt weak
- the product should not become a shallow chatbot
- future work should use a more structured rule engine and later AI assistance
  rather than repeating generic acknowledgements
- clicking the AskSafe Home brand should return home


## Prompt 9: Result Page Polish And Contextual Official Help

Purpose:

Refine the result page so it feels like a calm safety decision workflow rather
than a generic risk report. Make official help visible when risk is high, but do
not overload low-risk outcomes with too many help services.

Result:

v0 polished the result page hierarchy around a clearer pause-first message,
shorter decision questions, risk signals, safer next step, official help,
trusted support, and feedback actions. The team also decided that official help
should be contextual: full help for high-risk outcomes, lighter help for safer
or lower-risk outcomes.

Operational prompt summary:

```text
Please refine the result page only.

Make the top result feel calmer and more action-oriented:
- Use a short status badge such as "Pause first".
- Use a clear headline such as "Pause before sending money." when the result is about a risky money request.
- Keep the tone calm and supportive, not alarmist.

Add a compact "Before you decide" section with only the most useful questions.
For a money request from someone close, include checks such as:
- Is this a new number, account, or chat?
- How much money do they want, and how do they want it sent?
- Can you contact them using a saved number or account you already trust?

Keep the existing sections for safer next step, what stood out, what to hold off on, why this is worth a pause, and how to check before you act.

Make Official help in Australia contextual:
- High-risk results can show the full official help section.
- Medium-risk results can show a smaller help section focused on checking through official channels.
- Low-risk or safer results should not show a large official help block; keep only light footer links or a brief note.

Do not change backend, AWS, Bedrock, database, authentication, or persistence code.
```

Follow-up feedback:

- the page should not show every official help service for every safe or low-risk
  result
- help depth should match the risk level and signal type
- the result page should avoid making every situation feel like an emergency

## Prompt 10: Footer Disclaimer Polish

Purpose:

Make the footer disclaimer feel more like a formal product footer and less like
a heavy warning block.

Result:

v0 was asked to combine the two disclaimer sentences into one concise paragraph
while keeping the current footer structure and links.

Prompt:

```text
Please make a small footer polish only.

In the footer disclaimer card, combine the two disclaimer sentences into one paragraph instead of two separate paragraphs.

Use this exact text:

AskSafe is not an emergency service, government service, legal adviser, financial adviser, or medical adviser. Do not enter passwords, one-time codes, full card numbers, or sensitive identity details.

Keep the current footer layout, colours, spacing, links, and copyright text.
Do not change any other page sections.
Do not add backend, authentication, AWS, Bedrock, or database changes.
```

Notes:

- `Built for H0 with Vercel and AWS.` was intentionally removed from the
  copyright line.
- The footer should support trust without making the product look like a
  prototype or competition-only artifact.

## Prompt 11: Official Help Card Layout Polish

Purpose:

Improve the visual balance of the Official help in Australia section without
wrapping the entire section in another heavy outer card.

Result:

v0 was asked to keep the orange verification reminder and individual service
cards, but reduce empty space and make card heights feel balanced across desktop
and mobile.

Prompt:

```text
Please polish the Official help in Australia section only.

Do not wrap the whole section in another large outer card.

Keep the orange verification reminder bar.

Keep the help services as individual cards, but make the card heights feel balanced:
- Emergency should not look much taller or emptier than the other cards.
- Use consistent padding, minimum height, and vertical spacing across the four service cards.
- Desktop: keep a clean 2-column grid.
- Mobile: stack cards in one column.
- Keep all buttons large and easy to tap.

Do not change the result logic, analyzer, backend, AWS, Bedrock, or database code.
```

Notes:

- The team chose not to add an outer section card because the service cards are
  already framed.
- The desktop official help block can be more compact, especially the Emergency
  card.
- Mobile can remain more spacious as long as the tap targets stay comfortable.

## Scope Guards Repeated Throughout v0 Work

The team repeatedly used these boundaries to keep the product focused:

- no DynamoDB until the UI and workflow were coherent
- no Bedrock until deterministic rules were stable
- no real authentication until setup and sign-in shape were understood
- no "coming soon", "prototype", or "demo only" copy
- no generic chatbot positioning
- no automatic trusted-person sharing
- no family monitoring dashboard without user consent
- no claim that AskSafe can prove whether something is real

## What v0 Contributed

v0 was used for rapid UI and interaction development:

- first full AskSafe Home web app shell
- senior-friendly visual direction
- guided check flow
- deterministic local analysis experience
- mobile responsive layout
- trusted support setup UI
- practice examples
- footer and disclaimer treatment
- voice input and read-aloud UI
- mock setup and sign-in flow
- GitHub/Vercel project connection

The later repo work builds on this foundation with documentation, rules,
architecture, infrastructure, and cloud deployment planning.
