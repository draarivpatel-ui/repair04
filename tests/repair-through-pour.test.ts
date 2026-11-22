import { expect, test } from "bun:test"
import { FindClearancePathSolver } from "../lib/FindClearancePathSolver"
import { findClearancePath } from "../lib/findClearancePath"
import { getFixedObstacleViolations } from "../lib/getFixedObstacleViolations"
import { getNewViaPadViolations } from "../lib/getNewViaPadViolations"
import { makeBudgetInput, makeBudgetRoute } from "./fixtures/workBudgetFixture"

test("a through-via can cross a poured plane while wires respect the reserved layer", () => {
  const route = makeBudgetRoute("signal", [
    [-1, 0],
    [0, 0],
    [0, 0],
    [1, 0],
  ])
  route.route[2]!.z = 3
  route.route[3]!.z = 3
  route.vias = [{ x: 0, y: 0 }]
  const { srj, bounds } = makeBudgetInput([route])
  srj.layerCount = 4
  const obstacle = {
    type: "rect" as const,
    center: { x: 0, y: 0 },
    width: 12,
    height: 12,
    layers: ["inner1"],
    connectedTo: ["ground"],
    isCopperPour: true,
  }
  srj.obstacles.push(obstacle)
  const search = {
    srj,
    bounds,
    routes: [route],
    routeIndex: 0,
    start: route.route[0]!,
    end: route.route.at(-1)!,
    traceThickness: route.traceThickness,
    traceClearance: 0.1,
    viaClearance: 0.1,
    maxNodes: 1000,
    existingPath: route.route,
  }
  for (const isCopperPour of [true, false]) {
    obstacle.isCopperPour = isCopperPour
    const solver = new FindClearancePathSolver(search)
    solver.solve()
    expect(Boolean(solver.getOutput())).toBe(isCopperPour)
    expect(Boolean(findClearancePath(search))).toBe(isCopperPour)
    expect(getFixedObstacleViolations(search)).toHaveLength(
      isCopperPour ? 0 : 1,
    )
    expect(
      getNewViaPadViolations({
        ...search,
        previousRoutes: [route],
        includeExistingVias: [{ routeIndex: 0, viaIndex: 0 }],
      }),
    ).toHaveLength(isCopperPour ? 0 : 1)
  }

  obstacle.isCopperPour = true
  const planeWire = makeBudgetRoute("signal", [
    [-1, 0],
    [1, 0],
  ])
  for (const point of planeWire.route) point.z = 1
  const planarSearch = {
    ...search,
    routes: [planeWire],
    start: planeWire.route[0]!,
    end: planeWire.route[1]!,
    existingPath: planeWire.route,
    allowLayerChanges: false,
  }
  expect(findClearancePath(planarSearch)).toBeNull()
  const solver = new FindClearancePathSolver(planarSearch)
  solver.solve()
  expect(solver.getOutput()).toBeNull()
  expect(getFixedObstacleViolations(planarSearch)).toHaveLength(1)
})
