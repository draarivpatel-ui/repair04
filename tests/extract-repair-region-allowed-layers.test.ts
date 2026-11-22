import { expect, test } from "bun:test"
import { extractRepairRegion } from "../lib/extractRepairRegion"
import { regionSafetyFixture } from "./fixtures/regionSafetyFixture"

test("cropping a native route retains its allowed signal layers", (): void => {
  const input = regionSafetyFixture()
  Object.assign(input.routes[0]!, { allowedZLayers: [0, 3] })
  input.srj.layerCount = 4
  const region = extractRepairRegion(input)
  expect(region.routes[0]).toMatchObject({ allowedZLayers: [0, 3] })
})
