import test from "node:test"
import assert from "node:assert/strict"

import { HOME_SCREEN_COPY } from "./home-copy.ts"

test("home hero copy leads with remote and digital pressure moments", () => {
  assert.match(HOME_SCREEN_COPY.heroBody, /message, call, video chat, or payment request/i)
  assert.doesNotMatch(HOME_SCREEN_COPY.heroBody, /knock at the door/i)
})

test("home help points describe a safety decision workflow", () => {
  assert.equal(HOME_SCREEN_COPY.points[0].title, "Tell AskSafe what happened")
  assert.equal(HOME_SCREEN_COPY.points[1].title, "Get one safer next step")
  assert.match(HOME_SCREEN_COPY.points[1].body, /single safer thing to do next/i)
})