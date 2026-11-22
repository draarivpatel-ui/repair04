import { expect, test } from "bun:test"
import { FindClearancePathSolver } from "../lib/FindClearancePathSolver"
import { findClearancePath } from "../lib/findClearancePath"
import { makeBudgetInput, makeBudgetRoute } from "./fixtures/workBudgetFixture"

test("both clearance searches respect signal layers while permitting through vias", (): void => {
  const route = makeBudgetRoute("signal", [
    [-4, 0],
    [4, 0],
  ])
  const input = makeBudgetInput([route])
  input.srj.layerCount = 4
  input.srj.obstacles.push({
    type: "rect",
    center: { x: 0, y: 0 },
    width: 0.5,
    height: 20,
    layers: ["top", "bottom"],
    connectedTo: ["foreign"],
  })
  const args = {
    srj: input.srj,
    routes: input.routes,
    routeIndex: 0,
    start: route.route[0]!,
    end: route.route[1]!,
    bounds: input.bounds,
    traceThickness: 0.1,
    traceClearance: 0.1,
    viaClearance: 0.1,
    gridSize: 0.5,
    maxNodes: 30000,
  }
  expect(findClearancePath(args)).not.toBeNull()
  Object.assign(route, { allowedZLayers: [0, 3] })
  expect(findClearancePath(args)).toBeNull()
  const blocked = new FindClearancePathSolver(args)
  blocked.solve()
  expect(blocked.getOutput()).toBeNull()

  input.srj.obstacles[0]!.layers = ["top"]
  const path = findClearancePath(args)
  expect(path).not.toBeNull()
  const incremental = new FindClearancePathSolver(args)
  incremental.solve()
  expect(incremental.getOutput()).toEqual(path)
  expect(path!.some((point) => point.z === 3)).toBe(true)
  for (let index = 1; index < path!.length; index++) {
    const from = path![index - 1]!
    const to = path![index]!
    if (from.z === to.z) expect([0, 3]).toContain(from.z)
  }
})
