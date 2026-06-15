import test from "node:test"
import assert from "node:assert/strict"
import { getOfficialHelpResources } from "./official-help-resources.ts"

test("core official help resources have actionable links or phone numbers", () => {
  const resources = getOfficialHelpResources([
    "emergency",
    "scamwatch",
    "idcare",
    "acsc",
  ])

  assert.equal(resources.length, 4)

  for (const resource of resources) {
    assert.equal(Boolean(resource.phone || resource.url), true)
  }
})

test("ACSC includes a ReportCyber URL", () => {
  const [acsc] = getOfficialHelpResources(["acsc"])

  assert.match(acsc.url ?? "", /cyber\.gov\.au\/report-and-recover\/report/)
})
