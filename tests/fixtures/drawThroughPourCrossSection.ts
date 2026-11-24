import type { HighDensityRoute } from "high-density-repair03/lib"
import type { getFixedObstacleViolations } from "../../lib/getFixedObstacleViolations"

/** X–layer slice of the y=0 fixture. Vertical spacing is illustrative. */
export function drawThroughPourCrossSection({
  input,
  path,
  violations,
  isCopperPour,
  viaClearance,
}: {
  input: HighDensityRoute
  path: HighDensityRoute["route"] | null
  violations: ReturnType<typeof getFixedObstacleViolations>
  isCopperPour: boolean
  viaClearance: number
}): string {
  const x = (mm: number) => 240 + 100 * mm
  const y = (layer: number) => 96 + layer * 37
  const route = path ?? input.route
  const via = input.vias[0]!
  const viaX = x(via.x)
  const clearanceRadius = 100 * (input.viaDiameter / 2 + viaClearance)
  const line = route.map((point) => `${x(point.x)},${y(point.z)}`).join(" ")
  const planeY = y(1)
  const labels = ["Top", "Inner 1", "Inner 2", "Bottom"]
  return `<g font-family="sans-serif">
    <text x="18" y="29" font-size="20" font-weight="bold" fill="#172839">${isCopperPour ? "Ground pour" : "Solid copper pad"}</text>
    <text x="18" y="54" font-size="15" fill="${path ? "#09624f" : "#a33236"}">${path ? "Path found" : "No path"} · ${violations.length} via clearance violation${violations.length === 1 ? "" : "s"}</text>
    ${labels.map((label, layer) => `<text x="18" y="${y(layer) + 5}" font-size="14" fill="#52636f">${label}</text><path d="M81 ${y(layer)}H399" stroke="#c9d3d7" stroke-dasharray="3 4"/>`).join("")}
    <path d="M81 ${planeY}H399" stroke="#257662" stroke-width="11"/>
    ${path && isCopperPour ? `<rect x="${viaX - clearanceRadius}" y="${planeY - 7}" width="${2 * clearanceRadius}" height="14" fill="white"/>` : ""}
    <polyline points="${line}" fill="none" stroke="${path ? "#a15715" : "#74828e"}" stroke-width="5" ${path ? "" : 'stroke-dasharray="6 5"'}/>
    ${violations.map(({ center }) => `<g transform="translate(${x(center.x)} ${planeY})" stroke="#b9343a" fill="white"><circle r="12" stroke-width="2"/><path d="M-5 -5L5 5M5 -5L-5 5" stroke-width="2"/></g>`).join("")}
    <text x="81" y="244" font-size="14" fill="#425663">${!path ? "Dashed line = attempted signal route" : "Gap in the pour = clearance around the via"}</text>
  </g>`
}
