import assert from "node:assert/strict"
import test from "node:test"

import {
  createInMemoryRateLimiter,
  getRateLimitClientKey,
} from "./rate-limit.ts"

test("blocks a client after the configured request limit", () => {
  let now = 1_000
  const limiter = createInMemoryRateLimiter({
    limit: 2,
    windowMs: 1_000,
    now: () => now,
  })

  assert.deepEqual(limiter.check("client-a"), { ok: true })
  assert.deepEqual(limiter.check("client-a"), { ok: true })
  assert.deepEqual(limiter.check("client-a"), {
    ok: false,
    retryAfterSeconds: 1,
  })

  now = 2_001

  assert.deepEqual(limiter.check("client-a"), { ok: true })
})

test("keeps separate clients in separate buckets", () => {
  const limiter = createInMemoryRateLimiter({
    limit: 1,
    windowMs: 1_000,
    now: () => 5_000,
  })

  assert.deepEqual(limiter.check("client-a"), { ok: true })
  assert.deepEqual(limiter.check("client-b"), { ok: true })
  assert.deepEqual(limiter.check("client-a"), {
    ok: false,
    retryAfterSeconds: 1,
  })
})

test("uses the first forwarded IP as the client key", () => {
  const request = new Request("https://asksafe-home.vercel.app/api/safety-events", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 198.51.100.8",
    },
  })

  assert.equal(getRateLimitClientKey(request), "203.0.113.10")
})
