type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  limit: number
  windowMs: number
  now?: () => number
}

type RateLimitAllowed = {
  ok: true
}

type RateLimitBlocked = {
  ok: false
  retryAfterSeconds: number
}

type EventApiRateLimitResponse =
  | { ok: true }
  | {
      ok: false
      status: 429
      retryAfterSeconds: number
      body: { ok: false; reason: "rate-limited" }
    }

export function createInMemoryRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, RateLimitBucket>()
  const now = options.now ?? Date.now

  return {
    check(key: string): RateLimitAllowed | RateLimitBlocked {
      const currentTime = now()
      const existing = buckets.get(key)

      if (!existing || currentTime >= existing.resetAt) {
        buckets.set(key, {
          count: 1,
          resetAt: currentTime + options.windowMs,
        })
        return { ok: true }
      }

      if (existing.count >= options.limit) {
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1_000)),
        }
      }

      existing.count += 1
      return { ok: true }
    },
  }
}

export function getRateLimitClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")

  if (forwardedFor) {
    const firstForwardedIp = forwardedFor.split(",")[0]?.trim()
    if (firstForwardedIp) return firstForwardedIp
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown-client"
  )
}

const eventApiRateLimiter = createInMemoryRateLimiter({
  limit: 60,
  windowMs: 60_000,
})

export function checkEventApiRateLimit(
  request: Request,
  routeName: string,
): EventApiRateLimitResponse {
  const clientKey = getRateLimitClientKey(request)
  const result = eventApiRateLimiter.check(`${routeName}:${clientKey}`)

  if (result.ok) return { ok: true }

  return {
    ok: false,
    status: 429,
    retryAfterSeconds: result.retryAfterSeconds,
    body: { ok: false, reason: "rate-limited" },
  }
}
