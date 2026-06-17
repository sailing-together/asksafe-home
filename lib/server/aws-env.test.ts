import test from "node:test"
import assert from "node:assert/strict"
import {
  getAskSafeAwsEnv,
  getRequiredAskSafeAwsEnvNames,
} from "./aws-env.ts"

test("getAskSafeAwsEnv returns table names when required env exists", () => {
  const result = getAskSafeAwsEnv({
    AWS_REGION: "ap-southeast-2",
    ASKSAFE_EVENTS_TABLE: "asksafe-home-prod-events",
    ASKSAFE_FEEDBACK_TABLE: "asksafe-home-prod-feedback",
    ASKSAFE_SUPPORT_EVENTS_TABLE: "asksafe-home-prod-support-events",
  })

  assert.equal(result.ok, true)
  if (!result.ok) throw new Error("expected env to be valid")

  assert.equal(result.config.region, "ap-southeast-2")
  assert.equal(result.config.tables.events, "asksafe-home-prod-events")
  assert.equal(result.config.tables.feedback, "asksafe-home-prod-feedback")
  assert.equal(result.config.tables.supportEvents, "asksafe-home-prod-support-events")
})

test("getAskSafeAwsEnv reports missing required values", () => {
  const result = getAskSafeAwsEnv({
    AWS_REGION: "ap-southeast-2",
    ASKSAFE_EVENTS_TABLE: "asksafe-home-prod-events",
  })

  assert.equal(result.ok, false)
  if (result.ok) throw new Error("expected env to be invalid")

  assert.deepEqual(result.missing.sort(), [
    "ASKSAFE_FEEDBACK_TABLE",
    "ASKSAFE_SUPPORT_EVENTS_TABLE",
  ])
})

test("getRequiredAskSafeAwsEnvNames keeps the required env contract explicit", () => {
  assert.deepEqual(getRequiredAskSafeAwsEnvNames(), [
    "AWS_REGION",
    "ASKSAFE_EVENTS_TABLE",
    "ASKSAFE_FEEDBACK_TABLE",
    "ASKSAFE_SUPPORT_EVENTS_TABLE",
  ])
})
