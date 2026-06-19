import assert from "node:assert/strict"
import test from "node:test"

import nextConfig from "./next.config.mjs"

test("sets baseline security headers for all routes", async () => {
  assert.equal(typeof nextConfig.headers, "function")

  const headers = await nextConfig.headers()
  const allRoutes = headers.find((entry) => entry.source === "/(.*)")

  assert.ok(allRoutes, "expected a global route header rule")

  const headerValues = new Map(allRoutes.headers.map((header) => [header.key, header.value]))

  assert.equal(headerValues.get("X-Content-Type-Options"), "nosniff")
  assert.equal(headerValues.get("Referrer-Policy"), "strict-origin-when-cross-origin")
  assert.equal(headerValues.get("Strict-Transport-Security"), "max-age=63072000; includeSubDomains; preload")
  assert.equal(headerValues.get("X-Frame-Options"), "DENY")
  assert.equal(headerValues.get("Permissions-Policy"), "camera=(), geolocation=(), payment=(), usb=()")
  assert.match(
    headerValues.get("Content-Security-Policy-Report-Only") ?? "",
    /default-src 'self'/,
  )
})

test("does not ignore TypeScript build errors", () => {
  assert.notEqual(nextConfig.typescript?.ignoreBuildErrors, true)
})

test("keeps image optimization disabled for the current static asset setup", () => {
  assert.equal(nextConfig.images?.unoptimized, true)
})
