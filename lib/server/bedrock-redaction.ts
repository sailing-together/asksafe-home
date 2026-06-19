const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const CARD_NUMBER_PATTERN = /\b(?:\d[ -]?){13,19}\b/g
const ONE_TIME_CODE_PATTERN = /\b(?:code|otp|one[- ]?time code|verification code)\s*(?:is|:)?\s*\d{4,8}\b/gi
const PHONE_PATTERN = /\b(?:\+?61|0)[2-478](?:[ -]?\d){8}\b/g
const IDENTITY_DETAIL_PATTERN =
  /\b(?:medicare|passport|driver'?s licence|license|account number)\s*(?:number|is|:)?\s*[A-Z0-9 -]{5,}\b/gi

export function redactSensitiveTextForBedrock(text: string): string {
  return text
    .replace(CARD_NUMBER_PATTERN, "[card number removed]")
    .replace(ONE_TIME_CODE_PATTERN, "[one-time code removed]")
    .replace(EMAIL_PATTERN, "[email removed]")
    .replace(PHONE_PATTERN, "[phone number removed]")
    .replace(IDENTITY_DETAIL_PATTERN, "[identity detail removed]")
    .replace(/\s+/g, " ")
    .trim()
}
